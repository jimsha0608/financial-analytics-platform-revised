import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";

import ProtectedRoute from "./ProtectedRoute";

const mockUseAuth = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockUseAuth(),
}));

function renderProtectedRoute() {
  return render(
    <MemoryRouter initialEntries={["/dashboard"]}>
      <Routes>
        <Route path="/login" element={<div>Login Page</div>} />
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<div>Dashboard Content</div>} />
        </Route>
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("shows a spinner while auth state is loading", () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: true });
    renderProtectedRoute();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("redirects to /login when there is no authenticated user", () => {
    mockUseAuth.mockReturnValue({ user: null, isLoading: false });
    renderProtectedRoute();
    expect(screen.getByText("Login Page")).toBeInTheDocument();
    expect(screen.queryByText("Dashboard Content")).not.toBeInTheDocument();
  });

  it("renders the protected content when a user is authenticated", () => {
    mockUseAuth.mockReturnValue({ user: { id: 1, email: "a@b.com" }, isLoading: false });
    renderProtectedRoute();
    expect(screen.getByText("Dashboard Content")).toBeInTheDocument();
  });
});
