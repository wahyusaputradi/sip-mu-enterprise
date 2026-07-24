<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

class NotificationController extends Controller
{
    /**
     * Get unread notifications for the authenticated user.
     */
    public function getUnread(Request $request)
    {
        try {
            $user = $request->user();
            if (!$user) {
                return response()->json(['notifications' => []]);
            }

            $notifications = $user->unreadNotifications()
                ->limit(10)
                ->get()
                ->map(function ($notification) {
                    $data = is_string($notification->data) ? json_decode($notification->data, true) : ($notification->data ?? []);
                    $createdAt = '';
                    if ($notification->created_at) {
                        $createdAt = is_string($notification->created_at) 
                            ? \Carbon\Carbon::parse($notification->created_at)->diffForHumans() 
                            : $notification->created_at->diffForHumans();
                    }

                    return [
                        'id' => $notification->id,
                        'type' => $notification->type,
                        'data' => $data,
                        'created_at' => $createdAt,
                        'read_at' => $notification->read_at,
                    ];
                });

            return response()->json(['notifications' => $notifications]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Notification getUnread error: ' . $e->getMessage());
            return response()->json(['notifications' => []]);
        }
    }

    /**
     * Mark a specific notification as read.
     */
    public function markAsRead(Request $request, $id)
    {
        try {
            $user = $request->user();
            if ($user) {
                $notification = $user->notifications()->where('id', $id)->first();
                if ($notification) {
                    $notification->markAsRead();
                    return response()->json(['success' => true]);
                }
            }
            return response()->json(['success' => false], 404);
        } catch (\Throwable $e) {
            return response()->json(['success' => false], 500);
        }
    }

    /**
     * Mark all notifications as read.
     */
    public function markAllAsRead(Request $request)
    {
        try {
            $user = $request->user();
            if ($user) {
                $user->unreadNotifications->markAsRead();
                return response()->json(['success' => true]);
            }
            return response()->json(['success' => false], 404);
        } catch (\Throwable $e) {
            return response()->json(['success' => false], 500);
        }
    }
}
