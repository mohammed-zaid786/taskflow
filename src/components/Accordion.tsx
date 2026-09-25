import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDown } from "lucide-react";

// Radix Root component
export const Accordion = AccordionPrimitive.Root;

// Har section ka container
export function AccordionItem({ className = "", ...props }: AccordionPrimitive.AccordionItemProps) {
  return (
    <AccordionPrimitive.Item
      className={`border border-gray-200 dark:border-slate-700 rounded-lg overflow-hidden ${className}`}
      {...props}
    />
  );
}

// Click karne wala header bar
export function AccordionTrigger({
  children,
  className = "",
  ...props
}: AccordionPrimitive.AccordionTriggerProps) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        className={`flex flex-1 items-center justify-between px-4 py-3 text-sm font-medium text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-all [&[data-state=open]>svg]:rotate-180 ${className}`}
        {...props}
      >
        {children}
        <ChevronDown className="h-4 w-4 shrink-0 transition-transform duration-200 text-gray-500" />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// Khulne wala content
export function AccordionContent({
  children,
  className = "",
  ...props
}: AccordionPrimitive.AccordionContentProps) {
  return (
    <AccordionPrimitive.Content
      className={`overflow-hidden text-xs text-gray-600 dark:text-gray-400 px-4 pb-3 pt-1 transition-all ${className}`}
      {...props}
    >
      <div>{children}</div>
    </AccordionPrimitive.Content>
  );
}