<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Models\Invoice;
use App\Models\Payment;
use App\Models\Project;
use App\Models\User;
use App\Notifications\InvoicePaidNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class InvoiceController extends Controller
{
    public function index(Request $request)
    {
        $query = Invoice::with('client:id,company');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('number', 'like', "%{$search}%")
                  ->orWhereHas('client', fn ($q) => $q->where('company', 'like', "%{$search}%"));
            });
        }

        $invoices = $query->latest()->paginate(20)->withQueryString();

        $stats = [
            'total_revenue' => Invoice::status('paid')->sum('total'),
            'outstanding' => Invoice::unpaid()->sum('total') - Payment::whereHas('invoice', fn ($q) => $q->unpaid())->sum('amount'),
            'overdue' => Invoice::overdue()->count(),
            'draft' => Invoice::status('draft')->count(),
        ];

        return Inertia::render('Admin/Invoices/Index', [
            'invoices' => $invoices,
            'stats' => $stats,
            'filters' => $request->only(['status', 'search']),
        ]);
    }

    public function create()
    {
        $clients = Client::active()->orderBy('company')->pluck('company', 'id');
        $projects = Project::active()->orderBy('name')->get(['id', 'name', 'client_id']);
        $nextNumber = Invoice::generateNumber();

        return Inertia::render('Admin/Invoices/Create', [
            'clients' => $clients,
            'projects' => $projects,
            'nextNumber' => $nextNumber,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'number' => 'required|string|unique:invoices,number',
            'client_id' => 'required|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.rate' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount' => 'nullable|numeric|min:0',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'status' => 'nullable|string|in:' . implode(',', Invoice::STATUSES),
            'notes' => 'nullable|string|max:5000',
        ]);

        // Calculate totals
        $items = collect($validated['items'])->map(function ($item) {
            $item['amount'] = round($item['qty'] * $item['rate'], 2);
            return $item;
        })->toArray();

        $subtotal = collect($items)->sum('amount');
        $taxRate = $validated['tax_rate'] ?? 0;
        $taxAmount = round($subtotal * ($taxRate / 100), 2);
        $discount = $validated['discount'] ?? 0;
        $total = $subtotal + $taxAmount - $discount;

        $invoice = Invoice::create([
            'number' => $validated['number'],
            'client_id' => $validated['client_id'],
            'project_id' => $validated['project_id'] ?? null,
            'items' => $items,
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'discount' => $discount,
            'total' => $total,
            'issue_date' => $validated['issue_date'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'] ?? 'draft',
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('admin.invoices.show', $invoice)->with('success', 'Invoice created.');
    }

    public function show(Invoice $invoice)
    {
        $invoice->load(['client', 'project', 'payments']);
        $internalNotes = $invoice->notes()->with('user')->get();

        return Inertia::render('Admin/Invoices/Show', [
            'invoice' => $invoice,
            'paidAmount' => $invoice->paid_amount,
            'outstanding' => $invoice->outstanding,
            'internalNotes' => $internalNotes,
        ]);
    }

    public function update(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'project_id' => 'nullable|exists:projects,id',
            'items' => 'required|array|min:1',
            'items.*.description' => 'required|string|max:255',
            'items.*.qty' => 'required|numeric|min:0.01',
            'items.*.rate' => 'required|numeric|min:0',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'discount' => 'nullable|numeric|min:0',
            'issue_date' => 'required|date',
            'due_date' => 'required|date|after_or_equal:issue_date',
            'status' => 'required|string|in:' . implode(',', Invoice::STATUSES),
            'notes' => 'nullable|string|max:5000',
        ]);

        $items = collect($validated['items'])->map(function ($item) {
            $item['amount'] = round($item['qty'] * $item['rate'], 2);
            return $item;
        })->toArray();

        $subtotal = collect($items)->sum('amount');
        $taxRate = $validated['tax_rate'] ?? 0;
        $taxAmount = round($subtotal * ($taxRate / 100), 2);
        $discount = $validated['discount'] ?? 0;
        $total = $subtotal + $taxAmount - $discount;

        $invoice->update([
            'client_id' => $validated['client_id'],
            'project_id' => $validated['project_id'] ?? null,
            'items' => $items,
            'subtotal' => $subtotal,
            'tax_rate' => $taxRate,
            'tax_amount' => $taxAmount,
            'discount' => $discount,
            'total' => $total,
            'issue_date' => $validated['issue_date'],
            'due_date' => $validated['due_date'],
            'status' => $validated['status'],
            'notes' => $validated['notes'] ?? null,
        ]);

        return redirect()->route('admin.invoices.show', $invoice)->with('success', 'Invoice updated.');
    }

    public function destroy(Invoice $invoice)
    {
        $invoice->delete();
        return redirect()->route('admin.invoices.index')->with('success', 'Invoice deleted.');
    }

    /**
     * Record a payment for an invoice.
     */
    public function addPayment(Request $request, Invoice $invoice)
    {
        $validated = $request->validate([
            'amount' => 'required|numeric|min:0.01',
            'method' => 'nullable|string|in:' . implode(',', Payment::METHODS),
            'reference' => 'nullable|string|max:255',
            'payment_date' => 'required|date',
            'notes' => 'nullable|string|max:1000',
        ]);

        $invoice->payments()->create($validated);

        // Auto-mark as paid if fully paid
        $totalPaid = $invoice->payments()->sum('amount');
        if ($totalPaid >= $invoice->total && $invoice->status !== Invoice::STATUS_PAID) {
            $invoice->update(['status' => Invoice::STATUS_PAID]);
            User::all()->each(fn ($user) => $user->notify(new InvoicePaidNotification($invoice)));
        }

        return back()->with('success', 'Payment recorded.');
    }
}
