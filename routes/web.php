<?php

use App\Http\Controllers\Admin\ContactController as AdminContactController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\LegalPageController as AdminLegalPageController;
use App\Http\Controllers\Admin\PartnerController;
use App\Http\Controllers\Admin\ProductController;
use App\Http\Controllers\Admin\ServiceController;
use App\Http\Controllers\Admin\SettingController;
use App\Http\Controllers\Admin\TeamMemberController;
use App\Http\Controllers\Admin\TestimonialController;
use App\Http\Controllers\ContactFormController;
use App\Http\Controllers\LegalPageController;
use App\Http\Controllers\PageController;
use App\Http\Controllers\ProductPageController;
use App\Http\Controllers\ProfileController;
use Illuminate\Support\Facades\Route;

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

    // Team Members
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

    // Legal Pages
    Route::resource('legal-pages', AdminLegalPageController::class)->parameters(['legal-pages' => 'legal_page']);
});

// Profile (from Breeze)
Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
