import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useTheme,
  type Theme,
  COLOR_SCHEME_QUERY,
} from "@/components/theme-provider";
import { MoonIcon, SunIcon } from "@phosphor-icons/react";
import { useEffect, useState } from "react";

const isDarkTheme = (t: Theme) =>
  t === "dark" ||
  (t === "system" && window.matchMedia(COLOR_SCHEME_QUERY).matches);

export const ModeToggle = () => {
  const { theme, setTheme } = useTheme();

  const [isDark, setIsDark] = useState(() => isDarkTheme(theme));

  useEffect(() => {
    requestAnimationFrame(() =>
      requestAnimationFrame(() => setIsDark(isDarkTheme(theme))),
    );
  }, [theme]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <SunIcon
            className={`h-[1.2rem] w-[1.2rem] transition-all ${isDark ? "scale-0 -rotate-90" : "scale-100 rotate-0"}`}
          />
          <MoonIcon
            className={`absolute h-[1.2rem] w-[1.2rem] transition-all ${isDark ? "scale-100 rotate-0" : "scale-0 rotate-90"}`}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
