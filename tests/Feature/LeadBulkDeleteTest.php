<?php

namespace Tests\Feature;

use App\Models\Lead;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class LeadBulkDeleteTest extends TestCase
{
    use RefreshDatabase;

    protected function makeLeads(int $n): array
    {
        return collect(range(1, $n))->map(fn ($i) => Lead::create([
            'name' => "Lead {$i}", 'email' => "lead{$i}@example.com", 'status' => Lead::STATUS_NEW,
        ])->id)->all();
    }

    public function test_super_admin_can_delete_selected_leads(): void
    {
        $admin = User::factory()->create(['team_role' => User::ROLE_SUPER_ADMIN]);
        [$a, $b, $c] = $this->makeLeads(3);

        $this->actingAs($admin)
            ->from('/admin/leads')
            ->post('/admin/leads/bulk-delete', ['ids' => [$a, $b]])
            ->assertRedirect('/admin/leads')
            ->assertSessionHas('success', '2 leads deleted.');

        $this->assertSame([$c], Lead::pluck('id')->all());
    }

    public function test_sales_user_cannot_bulk_delete(): void
    {
        $sales = User::factory()->create(['team_role' => User::ROLE_SALES]);
        $ids = $this->makeLeads(2);

        $this->actingAs($sales)->post('/admin/leads/bulk-delete', ['ids' => $ids])->assertForbidden();
        $this->actingAs($sales)->delete('/admin/leads/' . $ids[0])->assertForbidden();

        $this->assertSame(2, Lead::count());
    }

    public function test_ids_are_required(): void
    {
        $admin = User::factory()->create(['team_role' => User::ROLE_SUPER_ADMIN]);

        $this->actingAs($admin)->post('/admin/leads/bulk-delete', ['ids' => []])->assertSessionHasErrors('ids');
    }
}
