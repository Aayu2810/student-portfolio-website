"use client";

import { useState } from "react";
import { Users, Lock, Globe, Eye, Edit3, Trash2, Check } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface AccessUser {
  id: string;
  email: string;
  permission: "view" | "edit";
  addedAt: string;
}

interface AccessControlProps {
  isPublic: boolean;
  onTogglePublic: (isPublic: boolean) => void;
  users: AccessUser[];
  onAddUser: (email: string, permission: "view" | "edit") => void;
  onUpdatePermission: (userId: string, permission: "view" | "edit") => void;
  onRemoveUser: (userId: string) => void;
}

export function AccessControl({
  isPublic,
  onTogglePublic,
  users,
  onAddUser,
  onUpdatePermission,
  onRemoveUser,
}: AccessControlProps) {
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPermission, setNewUserPermission] = useState<"view" | "edit">("view");
  const [error, setError] = useState("");

  const handleAddUser = () => {
    if (!newUserEmail.trim()) {
      setError("Please enter an email address");
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newUserEmail)) {
      setError("Please enter a valid email address");
      return;
    }

    // Check if user already has access
    if (users.some((u) => u.email === newUserEmail)) {
      setError("This user already has access");
      return;
    }

    onAddUser(newUserEmail, newUserPermission);
    setNewUserEmail("");
    setNewUserPermission("view");
    setError("");
  };

  return (
    <div className="space-y-6">
      {/* Public Access Toggle */}
      <Card className="p-4 bg-white/5 backdrop-blur-sm border border-white/10">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-purple-400/10 rounded-lg">
              {isPublic ? (
                <Globe className="w-5 h-5 text-purple-400" />
              ) : (
                <Lock className="w-5 h-5 text-purple-400" />
              )}
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold">
                {isPublic ? "Public Access" : "Private Access"}
              </h3>
              <p className="text-sm text-gray-400 mt-1">
                {isPublic
                  ? "Anyone with the link can view this document"
                  : "Only people you specify can access this document"}
              </p>
            </div>
          </div>
          <Button
            onClick={() => onTogglePublic(!isPublic)}
            variant={isPublic ? "default" : "outline"}
            size="sm"
            className={
              isPublic
                ? "bg-purple-600 hover:bg-purple-700"
                : "border-white/10 hover:bg-purple-400/20"
            }
          >
            {isPublic ? "Make Private" : "Make Public"}
          </Button>
        </div>
      </Card>

      {/* Add User Section */}
      {!isPublic && (
        <Card className="p-4 bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-purple-400" />
              <h3 className="text-white font-semibold">Share with Specific People</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="md:col-span-2">
                <Input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => {
                    setNewUserEmail(e.target.value);
                    setError("");
                  }}
                  placeholder="Enter email address"
                  className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
                />
              </div>
              <Select
                value={newUserPermission}
                onValueChange={(value: "view" | "edit") => setNewUserPermission(value)}
              >
                <SelectTrigger className="bg-white/5 border-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-white/10">
                  <SelectItem value="view">Can View</SelectItem>
                  <SelectItem value="edit">Can Edit</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-red-400">{error}</p>
            )}

            <Button
              onClick={handleAddUser}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              Add Person
            </Button>
          </div>
        </Card>
      )}

      {/* Users List */}
      {!isPublic && users.length > 0 && (
        <Card className="p-4 bg-white/5 backdrop-blur-sm border border-white/10">
          <div className="space-y-4">
            <h3 className="text-white font-semibold">People with Access</h3>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-8 h-8 bg-purple-400/20 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-purple-400 text-sm font-medium">
                        {user.email.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm truncate">{user.email}</p>
                      <p className="text-xs text-gray-400">
                        <span suppressHydrationWarning>Added {new Date(user.addedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Select
                      value={user.permission}
                      onValueChange={(value: "view" | "edit") =>
                        onUpdatePermission(user.id, value)
                      }
                    >
                      <SelectTrigger className="w-32 h-8 bg-white/5 border-white/10 text-white text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-white/10">
                        <SelectItem value="view">
                          <div className="flex items-center gap-2">
                            <Eye className="w-3 h-3" />
                            <span>Can View</span>
                          </div>
                        </SelectItem>
                        <SelectItem value="edit">
                          <div className="flex items-center gap-2">
                            <Edit3 className="w-3 h-3" />
                            <span>Can Edit</span>
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>

                    <Button
                      onClick={() => onRemoveUser(user.id)}
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}