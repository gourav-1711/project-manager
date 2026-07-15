/* @workspace/ui — shared shadcn-based components */

// Context providers
export { ThemeProvider } from "next-themes";

// Components
export { Button, buttonVariants } from "./components/ui/button";
export {
  Card, CardHeader, CardFooter, CardTitle,
  CardAction, CardDescription, CardContent,
} from "./components/ui/card";
export { Input } from "./components/ui/input";
export { Textarea } from "./components/ui/textarea";
export { Label } from "./components/ui/label";
export { Badge, badgeVariants } from "./components/ui/badge";
export {
  Dialog, DialogClose, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogOverlay, DialogPortal,
  DialogTitle, DialogTrigger,
} from "./components/ui/dialog";
export {
  AlertDialog, AlertDialogPortal, AlertDialogOverlay, AlertDialogTrigger,
  AlertDialogContent, AlertDialogHeader, AlertDialogFooter,
  AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel,
} from "./components/ui/alert-dialog";
export {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuGroup, DropdownMenuLabel, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuPortal,
} from "./components/ui/dropdown-menu";
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from "./components/ui/tooltip";
export { Toaster } from "./components/ui/sonner";

// Skiper UI (smooth input)
export { SmoothInput, Skiper106 } from "./components/ui/skiper-ui/skiper106";

// Animated components (Magic UI)
export { ShimmerButton, type ShimmerButtonProps } from "./components/ui/shimmer-button";
export { MagicCard } from "./components/ui/magic-card";
export { Marquee } from "./components/ui/marquee";
export { AnimatedList, AnimatedListItem } from "./components/ui/animated-list";

// Animated components (Aceternity UI)
export { Spotlight } from "./components/ui/spotlight";
export { WobbleCard } from "./components/ui/wobble-card";
export { BackgroundBeamsWithCollision } from "./components/ui/background-beams-with-collision";

// Utilities
export { cn } from "./lib/utils";
