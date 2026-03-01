"use client";
import { useEffect, useState, useRef } from "react";
import {
  format,
  parse,
  isValid,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  addDays,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
} from "date-fns";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import React from "react";
import { usePathname } from "next/navigation";
import { ptBR } from "date-fns/locale";
import { useFeriados } from "@/contexts/FeriadosContext";

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export function DatePicker({
  onChangePreset,
  onChange,
  selected,
}: DatePickerProps) {
  const { feriados, setFeriados } = useFeriados();
  const pathname = usePathname();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focused2, setFocused2] = useState(false);
  const [focused3, setFocused3] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [inputValue3, setInputValue3] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const ValueRef = useRef<HTMLInputElement | null>(null);
  const ValueRef2 = useRef<HTMLInputElement | null>(null);
  const ValueRef3 = useRef<HTMLInputElement | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (index === 3 && ValueRef3.current?.value === "") {
        ValueRef2.current?.focus();
      } else if (index === 2 && ValueRef2.current?.value === "") {
        ValueRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    if (selected) {
      const [year, month, day] = selected.split("-");
      setInputValue(day);
      setInputValue2(month);
      if (parseInt(year) > new Date().getFullYear()) {
        if (new Date().getFullYear() !== undefined) {
          setInputValue3(new Date().getFullYear().toString());
        }
      } else if (parseInt(year) < new Date().getFullYear()) {
        setInputValue3(new Date().getFullYear().toString());
      } else {
        setInputValue3(year);
      }
      // const typedDate = parse(
      //   `${inputValue3}-${inputValue2}-${inputValue}`,
      //   "yyyy-MM-dd",
      //   new Date(),
      // );
      // console.log(typedDate, "Recorrigido")
    }
  }, [selected]);

  useEffect(() => {
    if (isNaN(parseInt(inputValue.slice(-1)))) {
      setInputValue(inputValue.slice(0, -1));
    } else if (inputValue === "00") {
      setInputValue("01");
    } else if (parseInt(inputValue) > 31) {
      setInputValue("31");
    } else if (
      inputValue2 === "1" ||
      inputValue2 === "3" ||
      inputValue2 === "5" ||
      inputValue2 === "7" ||
      inputValue2 === "8" ||
      inputValue2 === "10" ||
      inputValue2 === "12"
    ) {
      if (parseInt(inputValue) > 31) {
        setInputValue("31");
      }
    } else if (
      inputValue2 === "4" ||
      inputValue2 === "6" ||
      inputValue2 === "9" ||
      inputValue2 === "11"
    ) {
      if (parseInt(inputValue) > 30) {
        setInputValue("30");
      }
    } else if (inputValue2 === "2") {
      if (parseInt(inputValue) > 28) {
        setInputValue("28");
      }
    } else {
      if (inputValue.length === 2) {
        ValueRef2.current?.focus();
        setInputValue(inputValue.slice(0, 2));
      }
    }
  }, [inputValue, inputValue2]);

  useEffect(() => {
    if (isNaN(parseInt(inputValue2.slice(-1)))) {
      setInputValue2(inputValue2.slice(0, -1));
    } else if (inputValue2 === "00") {
      setInputValue2("01");
    } else if (parseInt(inputValue2) > 12) {
      setInputValue2("12");
    } else {
      if (inputValue2.length === 2) {
        ValueRef3.current?.focus();
        setInputValue2(inputValue2.slice(0, 2));
      }
    }
  }, [inputValue2]);

  useEffect(() => {
    if (inputValue3.length === 4) {
      ValueRef3.current?.blur();
      setInputValue3(inputValue3.slice(0, 4));
    }
  }, [inputValue3]);

  useEffect(() => {
    if (isNaN(parseInt(inputValue3.slice(-1)))) {
      setInputValue3(inputValue3.slice(0, -1));
    }
  }, [inputValue3]);

  useEffect(() => {
    if (
      inputValue.length === 2 &&
      inputValue2.length === 2 &&
      inputValue3.length === 4
    ) {
      const typedDate = parse(
        `${inputValue3}-${inputValue2}-${inputValue}`,
        "yyyy-MM-dd",
        new Date(),
      );
      if (isValid(typedDate)) {
        setCalendarMonth(typedDate);
        setSelectedDate(typedDate);
        onChange(typedDate);
      }
    }
  }, [inputValue, inputValue2, inputValue3, onChange]);

  const currentYear = new Date().getFullYear();

  const handleDateSelect = (date: Date) => {
    if (date.getFullYear() < 1900 || date.getFullYear() > currentYear) return;
    const formatted = format(date, "dd/MM/yyyy");
    setSelectedDate(date);
    setInputValue(formatted.slice(0, 2));
    setInputValue2(formatted.slice(3, 5));
    setInputValue3(formatted.slice(6, 10));
    setCalendarMonth(date);
    setShowPicker(false);
    onChange(date); // mantém "YYYY-MM-DD"
  };

  const generateCalendar = () => {
    const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 0 });
    const end = endOfMonth(calendarMonth);
    const days: Date[] = [];

    let current = start;
    while (current <= end || days.length % 7 !== 0) {
      days.push(current);
      current = addDays(current, 1);
    }

    return days;
  };

  return (
    <div ref={ref} className="relative max-w-120">
      <div className="relative ">
        {/* <div
          className={`${
            focused || focused2 || focused3
              ? "border-yellow-400 shadow-[0_0_15px_rgba(255,215,0,0.2)]"
              : "border-gray-400"
          }  relative cursor-text py-3.5 px-3 pr-8 h-13.5 gap-1 text-[16px] flex w-full rounded-[15px] border `}
        > */}
        <div
          className={`${
            focused || focused2 || focused3 ? "" : "border-gray-400"
          }  relative cursor-text py-2.5 px-1 pr-8 h-12 gap-1 text-[16px] flex w-full rounded-[15px] border `}
        >
          <div className="relative text-gray-400 block w-7.75">
            {!focused && !inputValue && (
              <div className="w-full rounded-[5px] absolute text-center">
                dd
              </div>
            )}
            <input
              required
              ref={ValueRef}
              value={inputValue}
              onBlur={() => {
                setFocused(false);
                if (inputValue && inputValue.length === 1) {
                  setInputValue(inputValue.padStart(2, "0")); // "2" → "02"
                } else if (parseInt(inputValue) < 1) {
                  setInputValue("1");
                }
              }}
              onFocus={() => setFocused(true)}
              onChange={(e) => setInputValue(e.target.value)}
              className={`${
                focused ? "bg-[rgba(255,238,88,0.1)]" : "bg-transparent"
              } text-center text-black absolute w-full rounded-[5px] border-none outline-none transition-all ease-in-out duration-100 `}
            />
          </div>

          <div className="text-gray-400 ">/</div>

          <div className="relative text-gray-400 block w-7.75">
            {!focused2 && !inputValue2 && (
              <div className="w-full rounded-[5px] absolute text-center">
                mm
              </div>
            )}

            <input
              required
              ref={ValueRef2}
              onKeyDown={(e) => handleKeyDown(2, e)}
              value={inputValue2}
              onFocus={() => setFocused2(true)}
              onBlur={() => {
                setFocused2(false);
                if (inputValue2 && inputValue2.length === 1) {
                  setInputValue2(inputValue2.padStart(2, "0")); // "2" → "02"
                }
              }}
              onChange={(e) => setInputValue2(e.target.value)}
              className={`${
                focused2 ? "bg-[rgba(255,238,88,0.1)]" : "bg-transparent"
              } text-center  absolute w-full rounded-[5px] text-black border-none outline-none transition-all ease-in-out duration-100 `}
            />
          </div>

          <div className="text-gray-400 ">/</div>

          <div className="relative text-gray-400 block w-10.5">
            {!focused3 && !inputValue3 && (
              <div className="w-full rounded-[5px] absolute text-center">
                aaaa
              </div>
            )}

            <input
              required
              ref={ValueRef3}
              value={inputValue3}
              onKeyDown={(e) => handleKeyDown(3, e)}
              onFocus={() => setFocused3(true)}
              onBlur={() => {
                setFocused3(false);
              }}
              onChange={(e) => setInputValue3(e.target.value)}
              className={`${
                focused3 ? "bg-[rgba(255,238,88,0.1)]" : "bg-transparent"
              } text-center  absolute w-full rounded-[5px] text-black border-none outline-none transition-all ease-in-out duration-100 `}
            />
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="button"
          onClick={() => setShowPicker(!showPicker)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition-all ease-in-out duration-100 hover:text-yellow-400 cursor-pointer"
        >
          <CalendarDays size={18} />
        </motion.button>
      </div>

      <AnimatePresence>
        {showPicker && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{
              scale: 0,
              opacity: 0,
              transition: { duration: 0.15, ease: "easeInOut" },
            }}
            id="date-box"
            className={`absolute  ${onChangePreset === 1 ? "left-0 origin-top-right" : onChangePreset === 2 ? "right-0 origin-top-right" : "bottom-12 right-0 origin-bottom-right"} z-10 mt-2 min-w-52.5 rounded-[25px] border border-gray-400 bg-[rgba(12,12,14,0.985)] shadow-xl origin-top-right"`}
          >
            <div className=" rounded-[25px] p-4">
              {/* Calendar Header */}
              <div className="mb-3 flex items-center justify-between px-2 text-white">
                <button
                  type="button"
                  onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                >
                  <ChevronLeft size={20} className="cursor-pointer" />
                </button>
                <span className="text-[18px] text-center font-medium">
                  {format(calendarMonth, "MMMM yyyy")}
                </span>
                <button
                  type="button"
                  onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                >
                  <ChevronRight size={20} className="cursor-pointer" />
                </button>
              </div>

              {/* Week Days */}
              <div className="grid grid-cols-7 gap-1 text-[20px] px-1 pb-1 text-white">
                {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
                  <div key={i} className="text-center ">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1 text-sm text-[#ffffffc7]">
                {generateCalendar().map((day, i) => {
                  const isSelected =
                    selectedDate && isSameDay(day, selectedDate);
                  const inCurrentMonth = isSameMonth(day, calendarMonth);
                  return (
                    <button
                      type="button"
                      key={i}
                      onClick={() => handleDateSelect(day)}
                      className={`rounded-md p-1 cursor-pointer text-center transition text-[18px] ${
                        isSelected
                          ? "bg-yellow-400 text-black font-medium"
                          : inCurrentMonth
                            ? "hover:bg-[rgba(255,238,88,0.1)]"
                            : "text-zinc-500 p-1 cursor-pointer"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

export function Calendar({ onChangePreset, onChange }: DatePickerProps) {
  const pathname = usePathname();
  const { feriados, setFeriados } = useFeriados();

  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focused2, setFocused2] = useState(false);
  const [focused3, setFocused3] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [inputValue3, setInputValue3] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const ValueRef = useRef<HTMLInputElement | null>(null);
  const ValueRef2 = useRef<HTMLInputElement | null>(null);
  const ValueRef3 = useRef<HTMLInputElement | null>(null);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleKeyUp = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (index === 3 && ValueRef3.current?.value === "") {
        ValueRef2.current?.focus();
      } else if (index === 2 && ValueRef2.current?.value === "") {
        ValueRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    if (isNaN(parseInt(inputValue.slice(-1)))) {
      setInputValue(inputValue.slice(0, -1));
    } else if (inputValue === "00") {
      setInputValue("01");
    } else if (parseInt(inputValue) > 31) {
      setInputValue("31");
    } else if (
      inputValue2 === "1" ||
      inputValue2 === "3" ||
      inputValue2 === "5" ||
      inputValue2 === "7" ||
      inputValue2 === "8" ||
      inputValue2 === "10" ||
      inputValue2 === "12"
    ) {
      if (parseInt(inputValue) > 31) {
        setInputValue("31");
      }
    } else if (
      inputValue2 === "4" ||
      inputValue2 === "6" ||
      inputValue2 === "9" ||
      inputValue2 === "11"
    ) {
      if (parseInt(inputValue) > 30) {
        setInputValue("30");
      }
    } else if (inputValue2 === "2") {
      if (parseInt(inputValue) > 28) {
        setInputValue("28");
      }
    } else {
      if (inputValue.length === 2) {
        ValueRef2.current?.focus();
        setInputValue(inputValue.slice(0, 2));
      }
    }
  }, [inputValue, inputValue2]);

  useEffect(() => {
    if (isNaN(parseInt(inputValue2.slice(-1)))) {
      setInputValue2(inputValue2.slice(0, -1));
    } else if (inputValue2 === "00") {
      setInputValue2("01");
    } else if (parseInt(inputValue2) > 12) {
      setInputValue2("12");
    } else {
      if (inputValue2.length === 2) {
        ValueRef3.current?.focus();
        setInputValue2(inputValue2.slice(0, 2));
      }
    }
  }, [inputValue2]);

  useEffect(() => {
    if (parseInt(inputValue3) > new Date().getFullYear()) {
      if (new Date().getFullYear() !== undefined) {
        setInputValue3(new Date().getFullYear().toString());
      }
    } else {
      if (inputValue3.length === 4) {
        ValueRef3.current?.blur();
        setInputValue3(inputValue3.slice(0, 4));
        if (parseInt(inputValue3) < 1901) {
          setInputValue3("1900");
        }
      }
    }
  }, [inputValue3]);

  useEffect(() => {
    if (isNaN(parseInt(inputValue3.slice(-1)))) {
      setInputValue3(inputValue3.slice(0, -1));
    }
  }, [inputValue3]);

  const currentYear = new Date().getFullYear();

  const handleDateSelect = (date: Date) => {
    if (date.getFullYear() < 1900 || date.getFullYear() > currentYear) return;
    const formatted = format(date, "dd/MM/yyyy");
    setSelectedDate(date);
    setInputValue(formatted.slice(0, 2));
    setInputValue2(formatted.slice(3, 5));
    setInputValue3(formatted.slice(6, 10));
    setCalendarMonth(date);
    setShowPicker(false);
    onChange(date); // mantém "YYYY-MM-DD"
  };

  const generateCalendar = () => {
    const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 0 });
    const end = endOfMonth(calendarMonth);
    const days: Date[] = [];

    let current = start;
    while (current <= end || days.length % 7 !== 0) {
      days.push(current);
      current = addDays(current, 1);
    }

    return days;
  };

  useEffect(() => {
    if (
      inputValue.length === 2 &&
      inputValue2.length === 2 &&
      inputValue3.length === 4
    ) {
      const typedDate = parse(
        `${inputValue3}-${inputValue2}-${inputValue}`,
        "yyyy-MM-dd",
        new Date(),
      );
      if (isValid(typedDate)) {
        setCalendarMonth(typedDate);
        setSelectedDate(typedDate);
        onChange(typedDate);
      }
    }
  }, [inputValue, inputValue2, inputValue3, onChange]);

  return (
    <div className="relative max-w-100">
      <motion.div
        id="date-box"
        className=" right-0 z-10 w-full rounded-[25px] shadow-xl origin-top-right"
      >
        <div ref={ref} className="rounded-[25px] p-4 bg-[#f7f7f7] min-h-80 w-100">
          {/* Calendar Header */}
          <div className="mb-3 flex items-center justify-between px-2  text-[rgba(215,171,42,1)] ">
            <button
              type="button"
              onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            >
              <ChevronLeft size={20} className="cursor-pointer" />
            </button>
            <span className="text-[18px] text-center font-medium">
              {format(calendarMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            >
              <ChevronRight size={20} className="cursor-pointer" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 text-[20px] px-1 pb-1 text-black rounded-t-2xl pt-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
              <div key={i} className="text-center ">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 pb-2 text-sm text-black rounded-b-2xl">
            {generateCalendar().map((day, i) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const inCurrentMonth = isSameMonth(day, calendarMonth);
              const isDay =
                feriados.filter(
                  (el) => el.date === day.toISOString().split("T")[0],
                ).length > 0
                  ? true
                  : false;

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    handleDateSelect(day);
                  }}
                  // onClick={() => console.log(day.toISOString())}
                  className={`rounded-md p-1 cursor-pointer text-center transition text-[18px] ${
                    isDay
                      ? "bg-yellow-400 text-black font-medium"
                      : inCurrentMonth
                        ? "hover:bg-[rgba(255,238,88,0.1)]"
                        : "text-zinc-500 p-1 cursor-pointer"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
// ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

type DatePickerProps = {
  onChangePreset?: number; // formato "YYYY-MM-DD"
  onChange: (date: Date) => void; // formato "YYYY-MM-DD"
  selected?: string;
  inicio?: Date; // formato "YYYY-MM-DD"
  fim?: Date; // formato "YYYY-MM-DD"
};

type Feriado = {
  date: string; // YYYY-MM-DD
  name: string;
  type?: string;
};

export function CalendarRecesso({
  onChangePreset,
  onChange,
  inicio,
  fim,
}: DatePickerProps) {
  const pathname = usePathname();
  const { feriados, setFeriados } = useFeriados();
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showPicker, setShowPicker] = useState(false);
  const [focused, setFocused] = useState(false);
  const [focused2, setFocused2] = useState(false);
  const [focused3, setFocused3] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [inputValue2, setInputValue2] = useState("");
  const [inputValue3, setInputValue3] = useState("");
  const [calendarMonth, setCalendarMonth] = useState(new Date());
  const ValueRef = useRef<HTMLInputElement | null>(null);
  const ValueRef2 = useRef<HTMLInputElement | null>(null);
  const ValueRef3 = useRef<HTMLInputElement | null>(null);
  const [recessos, setRecessos] = useState<Array<Feriado>>([]);
  const isSelectingFromCalendar = useRef(false);

  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (selectedDate) {
      const [year, month, day] = selectedDate
        .toISOString()
        .split("T")[0]
        .split("-");
      setInputValue(day);
      setInputValue2(month);
      setInputValue3(year);
    }
  }, [selectedDate]);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setShowPicker(false);
      }
    }

    document.addEventListener("mousedown", handleClick);

    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  const handleKeyUp = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace") {
      if (index === 3 && ValueRef3.current?.value === "") {
        ValueRef2.current?.focus();
      } else if (index === 2 && ValueRef2.current?.value === "") {
        ValueRef.current?.focus();
      }
    }
  };

  useEffect(() => {
    if (isNaN(parseInt(inputValue.slice(-1)))) {
      setInputValue(inputValue.slice(0, -1));
    } else if (inputValue === "00") {
      setInputValue("01");
    } else if (parseInt(inputValue) > 31) {
      setInputValue("31");
    } else if (
      inputValue2 === "1" ||
      inputValue2 === "3" ||
      inputValue2 === "5" ||
      inputValue2 === "7" ||
      inputValue2 === "8" ||
      inputValue2 === "10" ||
      inputValue2 === "12"
    ) {
      if (parseInt(inputValue) > 31) {
        setInputValue("31");
      }
    } else if (
      inputValue2 === "4" ||
      inputValue2 === "6" ||
      inputValue2 === "9" ||
      inputValue2 === "11"
    ) {
      if (parseInt(inputValue) > 30) {
        setInputValue("30");
      }
    } else if (inputValue2 === "2") {
      if (parseInt(inputValue) > 28) {
        setInputValue("28");
      }
    } else {
      if (inputValue.length === 2) {
        ValueRef2.current?.focus();
        setInputValue(inputValue.slice(0, 2));
      }
    }
  }, [inputValue, inputValue2]);

  useEffect(() => {
    if (isNaN(parseInt(inputValue2.slice(-1)))) {
      setInputValue2(inputValue2.slice(0, -1));
    } else if (inputValue2 === "00") {
      setInputValue2("01");
    } else if (parseInt(inputValue2) > 12) {
      setInputValue2("12");
    } else {
      if (inputValue2.length === 2) {
        ValueRef3.current?.focus();
        setInputValue2(inputValue2.slice(0, 2));
      }
    }
  }, [inputValue2]);

  useEffect(() => {
    if (parseInt(inputValue3) > new Date().getFullYear()) {
      if (new Date().getFullYear() !== undefined) {
        setInputValue3(new Date().getFullYear().toString());
      }
    } else {
      if (inputValue3.length === 4) {
        ValueRef3.current?.blur();
        setInputValue3(inputValue3.slice(0, 4));
        if (parseInt(inputValue3) < 1901) {
          setInputValue3("1900");
        }
      }
    }
  }, [inputValue3]);

  useEffect(() => {
    if (isNaN(parseInt(inputValue3.slice(-1)))) {
      setInputValue3(inputValue3.slice(0, -1));
    }
  }, [inputValue3]);

  const currentYear = new Date().getFullYear();

  const handleDateSelect = (date: Date) => {
    isSelectingFromCalendar.current = true;

    if (date.getFullYear() < 1900 || date.getFullYear() > currentYear) return;
    const formatted = format(date, "dd/MM/yyyy");
    setSelectedDate(date); 
    setInputValue(formatted.slice(0, 2));
    setInputValue2(formatted.slice(3, 5));
    setInputValue3(formatted.slice(6, 10));
    setCalendarMonth(date);
    setShowPicker(false);
    onChange(date); // mantém "YYYY-MM-DD"
  };

  const generateCalendar = () => {
    const start = startOfWeek(startOfMonth(calendarMonth), { weekStartsOn: 0 });
    const end = endOfMonth(calendarMonth);
    const days: Date[] = [];

    let current = start;
    while (current <= end || days.length % 7 !== 0) {
      days.push(current);
      current = addDays(current, 1);
    }

    return days;
  };

  useEffect(() => {
    if (!inicio) {
      setRecessos([]);
      return;
    }

    const newRecessos: Feriado[] = [];

    const start = new Date(inicio);

    if (!fim) {
      newRecessos.push({
        date: start.toISOString().split("T")[0],
        name: "Recesso",
      });
    } else {
      const current = new Date(start);
      const end = new Date(fim);

      while (current <= end) {
        newRecessos.push({
          date: current.toISOString().split("T")[0],
          name: "Recesso",
        });
        current.setDate(current.getDate() + 1);
      }
    }

    setRecessos(newRecessos); // ✅ only ONE state update
  }, [inicio, fim]);

 useEffect(() => {
  if (isSelectingFromCalendar.current) {
    isSelectingFromCalendar.current = false;
    return;
  }

  if (
    inputValue.length === 2 &&
    inputValue2.length === 2 &&
    inputValue3.length === 4
  ) {
    const typedDate = parse(
      `${inputValue3}-${inputValue2}-${inputValue}`,
      "yyyy-MM-dd",
      new Date(),
    );

    if (isValid(typedDate)) {
      setCalendarMonth(typedDate);
      setSelectedDate(typedDate);
      onChange(typedDate);
    }
  }
}, [inputValue, inputValue2, inputValue3]);

  return (
    <div className="relative  ">
      <motion.div
        id="date-box"
        className=" right-0 z-10 w-full rounded-[25px] shadow-xl origin-top-right"
      >
        <div ref={ref} className=" rounded-[25px] p-4 bg-[#f7f7f7]">
          {/* Calendar Header */}
          <div className="mb-3 flex items-center justify-between px-2  text-[rgba(215,171,42,1)] ">
            <button
              type="button"
              onClick={() => setCalendarMonth(subMonths(calendarMonth, 1))}
            >
              <ChevronLeft size={20} className="cursor-pointer" />
            </button>
            <span className="text-[18px] text-center font-medium">
              {format(calendarMonth, "MMMM yyyy")}
            </span>
            <button
              type="button"
              onClick={() => setCalendarMonth(addMonths(calendarMonth, 1))}
            >
              <ChevronRight size={20} className="cursor-pointer" />
            </button>
          </div>

          {/* Week Days */}
          <div className="grid grid-cols-7 gap-1 text-[20px] px-1 pb-1 text-black rounded-t-2xl pt-2">
            {["D", "S", "T", "Q", "Q", "S", "S"].map((day, i) => (
              <div key={i} className="text-center ">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Days */}
          <div className="grid grid-cols-7 gap-1 pb-2 text-sm text-black rounded-b-2xl">
            {generateCalendar().map((day, i) => {
              const isSelected = selectedDate && isSameDay(day, selectedDate);
              const inCurrentMonth = isSameMonth(day, calendarMonth);
              const isFeriado =
                feriados.filter(
                  (el) => el.date === day.toISOString().split("T")[0],
                ).length > 0
                  ? true
                  : false;
              const isRecesso =
                recessos.filter(
                  (el) => el.date === day.toISOString().split("T")[0],
                ).length > 0
                  ? true
                  : false;

              return (
                <button
                  type="button"
                  key={i}
                  onClick={() => {
                    handleDateSelect(day);
                  }}
                  // onClick={() => console.log(day.toISOString())}
                  className={`rounded-md p-1 cursor-pointer text-center transition text-[18px] ${
                    isFeriado
                      ? "bg-yellow-400 text-black font-medium"
                      : isRecesso
                        ? "bg-yellow-200 text-black font-medium"
                        : inCurrentMonth
                          ? "hover:bg-[rgba(255,238,88,0.1)]"
                          : "text-zinc-500 p-1 cursor-pointer"
                  }`}
                >
                  {day.getDate()}
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
