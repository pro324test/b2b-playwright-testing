"use client";
import { useAppDispatch, useAppSelector } from "@/redux/config/hooks";
import { logout } from "@/redux/features/auth/authSlice";
import { signOut } from "next-auth/react";
import React from "react";

export default function Page() {
  const authEntity = useAppSelector((state) => state.authSlice.authEntity);
  const dispatch = useAppDispatch();
  return (
    <div>
      <p>Dashboard</p>
      <button
        onClick={() => {
          console.log(authEntity);
        }}
      >
        me
      </button>
      <br />
      <button
        onClick={() => {
          dispatch(logout());
          signOut();
        }}
      >
        logout
      </button>
    </div>
  );
}
