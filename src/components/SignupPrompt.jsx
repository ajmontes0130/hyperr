import React from "react";
import { Link } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export default function SignupPrompt({ open, onClose, title = "Sign up to continue", message = "Create a free account to take action on hyperr.", redirect }) {
  const registerTo = redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : "/register";
  const loginTo = redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : "/login";
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-sm text-center">
        <DialogHeader className="items-center">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mb-2">
            <svg viewBox="0 0 100 100" className="w-6 h-6 text-primary" fill="none" stroke="currentColor" strokeWidth="9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M24 34H58" /><path d="M50 24L71 34L50 44" /><path d="M76 66H42" /><path d="M50 56L29 66L50 76" />
            </svg>
          </div>
          <DialogTitle className="font-display text-xl">{title}</DialogTitle>
          <DialogDescription>{message}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2 mt-4">
          <Link to={registerTo} onClick={onClose}>
            <Button className="w-full rounded-xl h-11">Sign up free</Button>
          </Link>
          <Link to={loginTo} onClick={onClose}>
            <Button variant="outline" className="w-full rounded-xl h-11">Log in</Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}