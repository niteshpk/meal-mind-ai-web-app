import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChefHat, User, LogOut, Heart, History, Calendar, TrendingUp, Moon, Sun, FileEdit, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTheme } from "next-themes";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LoginDialog } from "@/components/auth/LoginDialog";
import { RegisterDialog } from "@/components/auth/RegisterDialog";
import { useAuth } from "@/contexts/AuthContext";

export function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "register">("login");

  const handleAuthSuccess = () => {
    setShowLogin(false);
    setShowRegister(false);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="rounded-xl bg-primary p-2">
              <ChefHat className="h-6 w-6 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl text-primary">MealMind AI</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Your AI Recipe Generator
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/popular")}
              className="hidden sm:flex"
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Popular
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="hidden sm:flex"
            >
              {theme === "dark" ? (
                <Sun className="h-4 w-4" />
              ) : (
                <Moon className="h-4 w-4" />
              )}
            </Button>
            {isAuthenticated ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/favorites")}
                  className="hidden sm:flex"
                >
                  <Heart className="mr-2 h-4 w-4" />
                  Favorites
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/history")}
                  className="hidden sm:flex"
                >
                  <History className="mr-2 h-4 w-4" />
                  History
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/meal-planning")}
                  className="hidden sm:flex"
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Meal Plan
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/custom-recipes")}
                  className="hidden sm:flex"
                >
                  <FileEdit className="mr-2 h-4 w-4" />
                  Custom Recipes
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
                      <span className="hidden sm:inline">
                        {user?.name || user?.email?.split("@")[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => navigate("/popular")}>
                      <TrendingUp className="mr-2 h-4 w-4" />
                      Popular Recipes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/favorites")}>
                      <Heart className="mr-2 h-4 w-4" />
                      My Favorites
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/history")}>
                      <History className="mr-2 h-4 w-4" />
                      Recipe History
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/meal-planning")}>
                      <Calendar className="mr-2 h-4 w-4" />
                      Meal Planning
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/custom-recipes")}>
                      <FileEdit className="mr-2 h-4 w-4" />
                      Custom Recipes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/preferences")}>
                      <Settings className="mr-2 h-4 w-4" />
                      Preferences
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                      {theme === "dark" ? (
                        <>
                          <Sun className="mr-2 h-4 w-4" />
                          Light Mode
                        </>
                      ) : (
                        <>
                          <Moon className="mr-2 h-4 w-4" />
                          Dark Mode
                        </>
                      )}
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Logout
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Dialog open={showLogin || showRegister} onOpenChange={(open) => {
                if (!open) {
                  setShowLogin(false);
                  setShowRegister(false);
                }
              }}>
                <DialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAuthMode("login");
                      setShowLogin(true);
                    }}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Login
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  {authMode === "login" ? (
                    <LoginDialog
                      onSuccess={handleAuthSuccess}
                      onSwitchToRegister={() => {
                        setShowLogin(false);
                        setShowRegister(true);
                        setAuthMode("register");
                      }}
                    />
                  ) : (
                    <RegisterDialog
                      onSuccess={handleAuthSuccess}
                      onSwitchToLogin={() => {
                        setShowRegister(false);
                        setShowLogin(true);
                        setAuthMode("login");
                      }}
                    />
                  )}
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
