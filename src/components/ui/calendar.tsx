import * as React from "react";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from "lucide-react";
import { DayPicker, useDayPicker } from "react-day-picker";
import { ko } from "date-fns/locale";

import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

export type CalendarProps = React.ComponentProps<typeof DayPicker>;

function VerticalMonthCaption(props: React.ComponentProps<NonNullable<CalendarProps["components"]>["MonthCaption"]>) {
  const { months, previousMonth, nextMonth, goToMonth, labels } = useDayPicker();
  const { calendarMonth, displayIndex, children, className, ...divProps } = props as any;

  const isFirst = displayIndex === 0;
  const isLast = displayIndex === (months?.length ?? 1) - 1;

  return (
    <div {...divProps} className={cn("flex items-center justify-center", className)}>
      <div className="inline-flex items-center gap-2">
        <div className="min-w-0">{children}</div>
        <div className="flex flex-col">
          <button
            type="button"
            aria-label={labels.labelPrevious(previousMonth)}
            disabled={!isFirst || !previousMonth}
            onClick={() => {
              if (!previousMonth) return;
              goToMonth(previousMonth);
            }}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-6 w-6 p-0 opacity-70 hover:opacity-100 disabled:opacity-40",
            )}
          >
            <ChevronUp className="h-3.5 w-3.5" />
          </button>
          <button
            type="button"
            aria-label={labels.labelNext(nextMonth)}
            disabled={!isLast || !nextMonth}
            onClick={() => {
              if (!nextMonth) return;
              goToMonth(nextMonth);
            }}
            className={cn(
              buttonVariants({ variant: "ghost" }),
              "h-6 w-6 p-0 opacity-70 hover:opacity-100 disabled:opacity-40",
            )}
          >
            <ChevronDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  const navButtonClassName = cn(
    buttonVariants({ variant: "outline" }),
    "h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
  );

  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      // 기본 로케일을 한국어로 설정 (식단 생성 페이지 달력 월/요일이 한글로 표시됨)
      locale={props.locale ?? ko}
      // 기본 내비게이션은 숨기고(좌/우 화살표), 캡션에 커스텀 위/아래 화살표를 붙입니다.
      hideNavigation={props.hideNavigation ?? true}
      className={cn("p-3", className)}
      classNames={{
        // v9 키 기준
        months: "flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0",
        month: "space-y-4",
        month_caption: "flex justify-center pt-1 items-center",
        caption_label: "text-sm font-medium",
        nav: "space-x-1 flex items-center",
        button_previous: navButtonClassName,
        button_next: navButtonClassName,
        month_grid: "w-full border-collapse space-y-1",
        weekday: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        day: "h-9 w-9 text-center text-sm p-0 relative",
        day_button: cn(buttonVariants({ variant: "ghost" }), "h-9 w-9 p-0 font-normal aria-selected:opacity-100"),
        range_end: "day-range-end",
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-50",
        range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        hidden: "invisible",

        // v8/레거시 키도 같이 유지(혹시 내부/버전 차이 대응)
        caption: "flex justify-center pt-1 relative items-center",
        nav_button: navButtonClassName,
        nav_button_previous: "absolute left-1",
        nav_button_next: "absolute right-1",
        table: "w-full border-collapse space-y-1",
        head_row: "grid grid-cols-7",
        head_cell: "text-muted-foreground rounded-md w-9 font-normal text-[0.8rem] text-center",
        row: "flex w-full mt-2",
        cell: "h-9 w-9 text-center text-sm p-0 relative [&:has([aria-selected].day-range-end)]:rounded-r-md [&:has([aria-selected].day-outside)]:bg-accent/50 [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
        day_range_end: "day-range-end",
        day_selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        day_today: "bg-accent text-accent-foreground",
        day_outside:
          "day-outside text-muted-foreground opacity-50 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        day_disabled: "text-muted-foreground opacity-50",
        day_range_middle: "aria-selected:bg-accent aria-selected:text-accent-foreground",
        day_hidden: "invisible",
        ...classNames,
      }}
      components={{
        // react-day-picker v9부터는 IconLeft/IconRight 대신 Chevron 컴포넌트를 커스터마이즈합니다.
        Chevron: ({ className: chevronClassName, orientation, ..._props }) => {
          if (orientation === "left") {
            return <ChevronLeft className={cn("h-4 w-4", chevronClassName)} />;
          }
          if (orientation === "right") {
            return <ChevronRight className={cn("h-4 w-4", chevronClassName)} />;
          }
          // up/down은 현재 UI에서 사용 빈도가 낮아 기본 아이콘으로 폴백합니다.
          return <ChevronRight className={cn("h-4 w-4", chevronClassName)} />;
        },
        MonthCaption: VerticalMonthCaption,
        ...(props.components ?? {}),
      }}
      {...props}
    />
  );
}
Calendar.displayName = "Calendar";

export { Calendar };
