<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Note;
use App\Models\Lead;
use App\Models\Client;
use App\Models\Project;
use App\Models\Task;
use App\Models\Invoice;
use Illuminate\Http\Request;

class NoteController extends Controller
{
    private const MODEL_MAP = [
        'lead' => Lead::class,
        'client' => Client::class,
        'project' => Project::class,
        'task' => Task::class,
        'invoice' => Invoice::class,
    ];

    public function store(Request $request)
    {
        $validated = $request->validate([
            'notable_type' => 'required|string|in:lead,client,project,task,invoice',
            'notable_id' => 'required|integer',
            'body' => 'required|string|max:5000',
        ]);

        $modelClass = self::MODEL_MAP[$validated['notable_type']];
        $notable = $modelClass::findOrFail($validated['notable_id']);

        $notable->notes()->create([
            'user_id' => auth()->id(),
            'body' => $validated['body'],
        ]);

        return back()->with('success', 'Note added.');
    }

    public function destroy(Note $note)
    {
        $note->delete();

        return back()->with('success', 'Note deleted.');
    }
}
