<?php

use App\Http\Controllers\Admin\CampaignController;
use App\Http\Controllers\Admin\ClientController;
use App\Http\Controllers\Admin\ContactController as AdminContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\InvoiceController;
use App\Http\Controllers\Admin\LeadController;
use App\Http\Controllers\Admin\LegalPageController as AdminLegalPageController;
use App\Http\Controllers\Admin\MaintenanceController;
use App\Http\Controllers\Admin\NoteController;
use App\Http\Controllers\Admin\NotificationController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ProjectController;
use App\Http\Controllers\Admin\ProposalController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\SprintController;
use App\Http\Controllers\Admin\TaskController;
use App\Http\Controllers\Admin\TeamMemberController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\LegalPageController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductPageController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SitemapController;
use Illuminate\Support\Facades\Route;

// Sitemap
Route::get('/sitemap.xml', [SitemapController::class, 'index'])->name('sitemap');

// Public pages
Route::get('/', [PageController::class, 'home'])->name('home');
Route::get('/services', [PageController::class, 'services'])->name('services');
Route::get('/about', [PageController::class, 'about'])->name('about');
Route::get('/contact', [PageController::class, 'contact'])->name('contact');
Route::post('/contact', [ContactFormController::class, 'store'])->name('contact.store');

// Products
Route::get('/products', [ProductPageController::class, 'index'])->name('products.index');
Route::get('/products/{slug}', [ProductPageController::class, 'show'])->name('products.show');
Route::post('/products/{slug}/interest', [ProductPageController::class, 'storeInterest'])->name('products.interest');

// Legal pages (privacy, terms, etc.)
Route::get('/page/{slug}', [LegalPageController::class, 'show'])->name('legal.show');

// Admin routes
Route::middleware(['auth', 'verified'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [DashboardController::class, 'index'])->name('dashboard');

    // Settings
    Route::get('/settings', [SettingController::class, 'index'])->name('settings.index');
    Route::put('/settings', [SettingController::class, 'update'])->name('settings.update');

    // Services
    Route::resource('services', ServiceController::class);

    // Team Members (unified with users)
    Route::resource('team', TeamMemberController::class)->parameters(['team' => 'team_member']);

    // Testimonials
    Route::resource('testimonials', TestimonialController::class);

    // Partners
    Route::resource('partners', PartnerController::class);

    // Products
    Route::delete('/products/interests/{interest}', [ProductController::class, 'destroyInterest'])->name('products.interests.destroy');
    Route::resource('products', ProductController::class);

    // Contacts
    Route::get('/contacts', [AdminContactController::class, 'index'])->name('contacts.index');
    Route::get('/contacts/{contact}', [AdminContactController::class, 'show'])->name('contacts.show');
    Route::delete('/contacts/{contact}', [AdminContactController::class, 'destroy'])->name('contacts.destroy');

    // Leads
    Route::resource('leads', LeadController::class)->except(['edit']);
    Route::post('/leads/{lead}/convert', [ClientController::class, 'convertFromLead'])->name('leads.convert');

    // Clients
    Route::resource('clients', ClientController::class)->except(['edit']);

    // Projects
    Route::resource('projects', ProjectController::class)->except(['edit']);

    // Tasks
    Route::get('/tasks', [TaskController::class, 'index'])->name('tasks.index');
    Route::post('/tasks', [TaskController::class, 'store'])->name('tasks.store');
    Route::get('/tasks/{task}', [TaskController::class, 'show'])->name('tasks.show');
    Route::put('/tasks/{task}', [TaskController::class, 'update'])->name('tasks.update');
    Route::patch('/tasks/{task}/status', [TaskController::class, 'updateStatus'])->name('tasks.status');
    Route::delete('/tasks/{task}', [TaskController::class, 'destroy'])->name('tasks.destroy');
    Route::post('/tasks/{task}/comments', [TaskController::class, 'addComment'])->name('tasks.comments.store');

    // Sprints (project-scoped)
    Route::get('/projects/{project}/sprints', [SprintController::class, 'index'])->name('sprints.index');
    Route::post('/projects/{project}/sprints', [SprintController::class, 'store'])->name('sprints.store');
    Route::put('/sprints/{sprint}', [SprintController::class, 'update'])->name('sprints.update');
    Route::delete('/sprints/{sprint}', [SprintController::class, 'destroy'])->name('sprints.destroy');
    Route::post('/sprints/{sprint}/start', [SprintController::class, 'start'])->name('sprints.start');
    Route::post('/sprints/{sprint}/complete', [SprintController::class, 'complete'])->name('sprints.complete');

    // Invoices
    Route::resource('invoices', InvoiceController::class)->except(['edit']);
    Route::post('/invoices/{invoice}/payments', [InvoiceController::class, 'addPayment'])->name('invoices.payments.store');

    // Proposals
    Route::resource('proposals', ProposalController::class)->except(['edit']);
    Route::post('/proposals/{proposal}/accept', [ProposalController::class, 'accept'])->name('proposals.accept');

    // Notes (polymorphic)
    Route::post('/notes', [NoteController::class, 'store'])->name('notes.store');
    Route::delete('/notes/{note}', [NoteController::class, 'destroy'])->name('notes.destroy');

    // Notifications
    Route::get('/notifications', [NotificationController::class, 'index'])->name('notifications.index');
    Route::patch('/notifications/{id}/read', [NotificationController::class, 'markAsRead'])->name('notifications.read');
    Route::post('/notifications/mark-all-read', [NotificationController::class, 'markAllRead'])->name('notifications.markAllRead');

    // Campaign Analytics
    Route::get('/campaigns', [CampaignController::class, 'index'])->name('campaigns.index');

    // Reports
    Route::get('/reports', [ReportController::class, 'index'])->name('reports.index');
    Route::get('/reports/leads', [ReportController::class, 'leads'])->name('reports.leads');
    Route::get('/reports/revenue', [ReportController::class, 'revenue'])->name('reports.revenue');
    Route::get('/reports/projects', [ReportController::class, 'projects'])->name('reports.projects');
    Route::get('/reports/productivity', [ReportController::class, 'productivity'])->name('reports.productivity');

    // Legal Pages
    Route::resource('legal-pages', AdminLegalPageController::class)->parameters(['legal-pages' => 'legal_page']);

    // Maintenance (super admin only)
    Route::get('/maintenance', [MaintenanceController::class, 'index'])->name('maintenance.index');
    Route::post('/maintenance/clear-cache', [MaintenanceController::class, 'clearCache'])->name('maintenance.clearCache');
    Route::post('/maintenance/clear-log', [MaintenanceController::class, 'clearLog'])->name('maintenance.clearLog');
    Route::get('/maintenance/download-log', [MaintenanceController::class, 'downloadLog'])->name('maintenance.downloadLog');
});

// Profile (from Breeze)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
