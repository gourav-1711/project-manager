/* @workspace/ui — shared shadcn-based components */

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

// Styles (import in the app's entry CSS)
export { default as styles } from "./styles.css?inline";

// Utilities
export { cn } from "./lib/utils";
