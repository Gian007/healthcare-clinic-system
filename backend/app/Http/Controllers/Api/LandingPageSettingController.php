<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\LandingPageSetting;
use Illuminate\Http\Request;

class LandingPageSettingController extends Controller
{
    public function index()
    {
        $settings = LandingPageSetting::orderBy('sort_order', 'asc')->get();
        return response()->json($settings);
    }

    public function update(Request $request, $section_key)
    {
        $validated = $request->validate([
            'title' => 'nullable|string',
            'subtitle' => 'nullable|string',
            'content' => 'nullable|string',
            'image_url' => 'nullable|string',
            'button_text' => 'nullable|string',
            'button_link' => 'nullable|string',
            'is_visible' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $setting = LandingPageSetting::where('section_key', $section_key)->firstOrFail();
        $setting->update($validated);

        return response()->json(['message' => 'Section updated successfully', 'setting' => $setting]);
    }

    public function uploadImage(Request $request)
    {
        $request->validate([
            'image' => 'required|image|mimes:jpeg,png,jpg,gif,svg|max:2048',
        ]);

        if ($request->hasFile('image')) {
            $path = $request->file('image')->store('landing_page', 'public');
            return response()->json([
                'message' => 'Image uploaded successfully',
                'url' => asset('storage/' . $path),
                'path' => $path
            ]);
        }

        return response()->json(['message' => 'Failed to upload image'], 400);
    }
}
