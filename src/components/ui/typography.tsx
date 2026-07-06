import { cn } from "@/lib/utils";

type TypographyProps = React.HTMLAttributes<HTMLElement>;

export function H1({ className, ...props }: TypographyProps) {
  return <h1 className={cn("text-4xl font-semibold tracking-tight md:text-5xl", className)} {...props} />;
}

export function H2({ className, ...props }: TypographyProps) {
  return <h2 className={cn("text-3xl font-semibold tracking-tight md:text-4xl", className)} {...props} />;
}

export function H3({ className, ...props }: TypographyProps) {
  return <h3 className={cn("text-2xl font-semibold tracking-tight md:text-3xl", className)} {...props} />;
}

export function Lead({ className, ...props }: TypographyProps) {
  return <p className={cn("text-lg leading-8 text-muted-foreground", className)} {...props} />;
}

export function Body({ className, ...props }: TypographyProps) {
  return <p className={cn("text-base leading-7 text-foreground", className)} {...props} />;
}

export function Caption({ className, ...props }: TypographyProps) {
  return <p className={cn("text-sm leading-6 text-muted-foreground", className)} {...props} />;
}
