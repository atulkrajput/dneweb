<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ChatConversation;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ChatConversationController extends Controller
{
    public function index(Request $request)
    {
        $query = ChatConversation::with('lead:id,name,email')->latest('last_message_at');

        if ($request->query('filter') === 'leads') {
            $query->whereNotNull('lead_id');
        }

        $chats = $query->paginate(25)->withQueryString()->through(fn (ChatConversation $c) => [
            'id' => $c->id,
            'preview' => Str::limit(collect($c->messages)->firstWhere('role', 'user')['content'] ?? '', 120),
            'message_count' => $c->message_count,
            'page_url' => $c->page_url,
            'last_message_at' => $c->last_message_at?->toIso8601String(),
            'lead' => $c->lead ? ['id' => $c->lead->id, 'name' => $c->lead->name, 'email' => $c->lead->email] : null,
        ]);

        return Inertia::render('Admin/Chats/Index', [
            'chats' => $chats,
            'filter' => $request->query('filter', 'all'),
            'stats' => [
                'total' => ChatConversation::count(),
                'today' => ChatConversation::where('last_message_at', '>=', now()->startOfDay())->count(),
                'leads' => ChatConversation::whereNotNull('lead_id')->count(),
            ],
        ]);
    }

    public function show(ChatConversation $chat)
    {
        $chat->load('lead:id,name,email');

        return Inertia::render('Admin/Chats/Show', [
            'chat' => [
                'id' => $chat->id,
                'messages' => $chat->messages ?? [],
                'page_url' => $chat->page_url,
                'ip_address' => $chat->ip_address,
                'user_agent' => $chat->user_agent,
                'created_at' => $chat->created_at?->toIso8601String(),
                'last_message_at' => $chat->last_message_at?->toIso8601String(),
                'lead' => $chat->lead ? ['id' => $chat->lead->id, 'name' => $chat->lead->name, 'email' => $chat->lead->email] : null,
            ],
        ]);
    }

    public function destroy(ChatConversation $chat)
    {
        $chat->delete();

        return redirect()->route('admin.chats.index')->with('success', 'Conversation deleted.');
    }
}
