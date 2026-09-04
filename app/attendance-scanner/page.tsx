
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  FiAlertCircle,
  FiCheck,
  FiClock,
  FiEdit3,
  FiRefreshCw,
  FiSearch,
  FiUserCheck,
  FiUserX,
  FiX,
} from "react-icons/fi";

import {
  attendanceService,
  type AttendanceScannerResult,
} from "@/services/attendanceService";

import { groupService } from "@/services/groupService";
import { studentService } from "@/services/studentService";

import type {
  Group,
  Student,
} from "@/types";

type ScannerState =
  | "waiting"
  | "processing"
  | "success"
  | "already_registered"
  | "invalid"
  | "disabled"
  | "error";

const stateConfig: Record<
  ScannerState,
  {
    title: string;
    description: string;
    icon: typeof FiClock;
    className: string;
    iconClassName: string;
  }
> = {
  waiting: {
    title:
      "في انتظار مسح الكارت...",
    description:
      "مرر كارت الطالب أمام قارئ الباركود.",
    icon: FiClock,
    className:
      "border-slate-200 bg-white",
    iconClassName:
      "bg-slate-100 text-slate-500",
  },

  processing: {
    title:
      "جاري تسجيل الحضور...",
    description:
      "لحظة واحدة، جاري التحقق من بيانات الطالب.",
    icon: FiRefreshCw,
    className:
      "border-teal-100 bg-teal-50",
    iconClassName:
      "bg-white text-teal-600",
  },

  success: {
    title:
      "تم تسجيل الحضور بنجاح",
    description:
      "تم تسجيل حضور الطالب.",
    icon: FiCheck,
    className:
      "border-emerald-100 bg-emerald-50",
    iconClassName:
      "bg-white text-emerald-600",
  },

  already_registered: {
    title:
      "تم تسجيل الحضور مسبقًا",
    description:
      "تم تسجيل حضور الطالب في نفس اليوم بالفعل.",
    icon: FiUserCheck,
    className:
      "border-amber-100 bg-amber-50",
    iconClassName:
      "bg-white text-amber-600",
  },

  invalid: {
    title:
      "الكارت غير معروف",
    description:
      "لم يتم العثور على طالب مرتبط بهذا الكود.",
    icon: FiX,
    className:
      "border-red-100 bg-red-50",
    iconClassName:
      "bg-white text-red-600",
  },

  disabled: {
    title:
      "الطالب غير نشط",
    description:
      "لا يمكن تسجيل حضور طالب غير نشط.",
    icon: FiUserX,
    className:
      "border-orange-100 bg-orange-50",
    iconClassName:
      "bg-white text-orange-600",
  },

  error: {
    title:
      "حدث خطأ أثناء التسجيل",
    description:
      "تعذر إتمام عملية تسجيل الحضور. حاول مرة أخرى.",
    icon: FiAlertCircle,
    className:
      "border-red-100 bg-red-50",
    iconClassName:
      "bg-white text-red-600",
  },
};

export default function AttendanceScannerPage() {
  const scannerInputRef =
    useRef<HTMLInputElement>(null);

  const processingRef =
    useRef(false);

  const scanBufferRef =
    useRef("");

  const resetTimerRef =
    useRef<number | null>(null);

  const [scannerState, setScannerState] =
    useState<ScannerState>("waiting");

  const [lastResult, setLastResult] =
    useState<AttendanceScannerResult | null>(
      null,
    );

  const [scannerValue, setScannerValue] =
    useState("");

  const [manualOpen, setManualOpen] =
    useState(false);

  const [students, setStudents] =
    useState<Student[]>([]);

  const [groups, setGroups] =
    useState<Group[]>([]);

  const [manualSearch, setManualSearch] =
    useState("");

  const [manualLoading, setManualLoading] =
    useState(false);

  const [manualError, setManualError] =
    useState("");

  const focusScanner = useCallback(() => {
    window.setTimeout(() => {
      scannerInputRef.current?.focus();
    }, 0);
  }, []);

  const resetScanner = useCallback(() => {
    scanBufferRef.current = "";
    setScannerValue("");
    setLastResult(null);
    setScannerState("waiting");
    focusScanner();
  }, [focusScanner]);

  const handleScannerResult =
    useCallback(
      (
        result: AttendanceScannerResult,
      ) => {
        setLastResult(result);
        setScannerState(
          result.status,
        );

        if (
          result.status ===
            "success" ||
          result.status ===
            "already_registered" ||
          result.status ===
            "invalid" ||
          result.status ===
            "disabled" ||
          result.status ===
            "error"
        ) {
          window.setTimeout(() => {
            setScannerValue("");
            scanBufferRef.current =
              "";
            setLastResult(null);
            setScannerState(
              "waiting",
            );
            focusScanner();
          }, 1800);
        }
      },
      [focusScanner],
    );

  const processScan = useCallback(
    async (rawCode: string) => {
      const code =
        rawCode
          .replace(/[\r\n\t]/g, "")
          .trim();

      if (!code) {
        return;
      }

      if (processingRef.current) {
        return;
      }

      processingRef.current = true;

      setScannerState("processing");
      setLastResult(null);

      try {
        const result =
          await attendanceService.scanCheckIn(
            code,
          );

        handleScannerResult(
          result,
        );
      } catch {
        handleScannerResult({
          status: "error",
          record: null,
          studentId: null,
          studentName: null,
          checkedInAt: null,
          message:
            "حدث خطأ أثناء التسجيل.",
        });
      } finally {
        processingRef.current =
          false;
      }
    },
    [handleScannerResult],
  );

  const handleScannerKeyDown =
    useCallback(
      (
        event: React.KeyboardEvent<HTMLInputElement>,
      ) => {
        if (
          event.key === "Enter"
        ) {
          event.preventDefault();

          const code =
            scanBufferRef.current ||
            scannerValue;

          scanBufferRef.current =
            "";

          setScannerValue("");

          void processScan(code);

          return;
        }

        if (
          event.key === "Tab"
        ) {
          event.preventDefault();

          const code =
            scanBufferRef.current ||
            scannerValue;

          scanBufferRef.current =
            "";

          setScannerValue("");

          if (code.trim()) {
            void processScan(code);
          }
        }
      },
      [
        processScan,
        scannerValue,
      ],
    );

  const handleScannerChange =
    useCallback(
      (
        value: string,
      ) => {
        scanBufferRef.current =
          value;

        setScannerValue(value);

        if (
          resetTimerRef.current
        ) {
          window.clearTimeout(
            resetTimerRef.current,
          );
        }

        resetTimerRef.current =
          window.setTimeout(() => {
            scanBufferRef.current =
              "";
            setScannerValue("");
          }, 1500);
      },
      [],
    );

  useEffect(() => {
    focusScanner();

    const handleWindowKeyDown =
      (
        event: globalThis.KeyboardEvent,
      ) => {
        if (
          manualOpen ||
          event.ctrlKey ||
          event.altKey ||
          event.metaKey
        ) {
          return;
        }

        if (
          event.key === "Enter"
        ) {
          return;
        }

        if (
          event.key.length !== 1
        ) {
          return;
        }

        if (
          document.activeElement ===
            scannerInputRef.current
        ) {
          return;
        }

        scannerInputRef.current?.focus();
      };

    window.addEventListener(
      "keydown",
      handleWindowKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleWindowKeyDown,
      );

      if (
        resetTimerRef.current
      ) {
        window.clearTimeout(
          resetTimerRef.current,
        );
      }
    };
  }, [
    focusScanner,
    manualOpen,
  ]);

  useEffect(() => {
    if (!manualOpen) {
      return;
    }

    let mounted = true;

    const loadStudents =
      async () => {
        try {
          setManualLoading(true);
          setManualError("");

          const [
            studentsData,
            groupsData,
          ] = await Promise.all([
            studentService.list(),
            groupService.list(),
          ]);

          if (!mounted) {
            return;
          }

          setStudents(
            studentsData,
          );

          setGroups(
            groupsData,
          );
        } catch {
          if (mounted) {
            setManualError(
              "تعذر تحميل قائمة الطلاب.",
            );
          }
        } finally {
          if (mounted) {
            setManualLoading(
              false,
            );
          }
        }
      };

    void loadStudents();

    return () => {
      mounted = false;
    };
  }, [manualOpen]);

  const groupMap = useMemo(() => {
    const map = new Map<
      string,
      Group
    >();

    groups.forEach((group) => {
      map.set(
        group.id,
        group,
      );
    });

    return map;
  }, [groups]);

  const filteredManualStudents =
    useMemo(() => {
      const query =
        manualSearch
          .trim()
          .toLowerCase();

      if (!query) {
        return students;
      }

      return students.filter(
        (student) =>
          student.name
            .toLowerCase()
            .includes(query) ||
          student.studentId
            .toLowerCase()
            .includes(query) ||
          student.guardianName
            .toLowerCase()
            .includes(query) ||
          (student.phone ?? "")
            .toLowerCase()
            .includes(query),
      );
    }, [
      students,
      manualSearch,
    ]);

  const handleManualCheckIn =
    async (
      studentId: string,
    ) => {
      if (manualLoading) {
        return;
      }

      setManualLoading(true);
      setManualError("");

      try {
        const result =
          await attendanceService.manualCheckIn(
            studentId,
          );

        setManualOpen(false);
        setManualSearch("");

        handleScannerResult(
          result,
        );
      } catch {
        setManualError(
          "حدث خطأ أثناء التسجيل.",
        );
      } finally {
        setManualLoading(false);
      }
    };

  const config =
    stateConfig[scannerState];

  const StateIcon =
    config.icon;

  const displayedName =
    lastResult?.studentName ??
    "";

  const displayedTime =
    lastResult?.checkedInAt
      ? new Date(
          lastResult.checkedInAt,
        ).toLocaleTimeString(
          "ar-EG",
          {
            hour: "2-digit",
            minute: "2-digit",
          },
        )
      : "";

  return (
    <main
      dir="rtl"
      className="min-h-screen bg-slate-50"
      onClick={() => {
        if (!manualOpen) {
          focusScanner();
        }
      }}
    >
      <div className="mx-auto flex min-h-screen max-w-5xl flex-col px-4 py-6 sm:px-6 lg:px-8">
        <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="mb-2 text-xs font-medium text-slate-400">
              الحضور / تسجيل الحضور
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              تسجيل الحضور
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              مرر كارت الطالب أمام قارئ الباركود لتسجيل الحضور بسرعة.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>

            <span className="text-xs font-semibold text-slate-600">
              القارئ جاهز
            </span>
          </div>
        </header>

        <section
          className={`relative flex flex-1 flex-col items-center justify-center rounded-3xl border p-6 shadow-sm transition sm:p-10 ${config.className}`}
          onClick={(event) =>
            event.stopPropagation()
          }
        >
          <input
            ref={
              scannerInputRef
            }
            type="text"
            value={
              scannerValue
            }
            onChange={(event) =>
              handleScannerChange(
                event.target.value,
              )
            }
            onKeyDown={
              handleScannerKeyDown
            }
            autoComplete="off"
            autoCapitalize="off"
            spellCheck={false}
            aria-label="قارئ الباركود"
            className="pointer-events-none absolute h-px w-px opacity-0"
          />

          <div
            className={`flex h-24 w-24 items-center justify-center rounded-3xl shadow-sm ${config.iconClassName}`}
          >
            <StateIcon
              size={42}
              className={
                scannerState ===
                "processing"
                  ? "animate-spin"
                  : ""
              }
            />
          </div>

          <div className="mt-7 max-w-xl text-center">
            <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              {config.title}
            </h2>

            <p className="mt-3 text-sm leading-7 text-slate-500">
              {config.description}
            </p>
          </div>

          {lastResult && (
            <div className="mt-7 w-full max-w-xl rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
              {displayedName && (
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-teal-50 text-lg font-bold text-teal-700">
                    {displayedName.charAt(
                      0,
                    )}
                  </div>

                  <div className="min-w-0 flex-1 text-right">
                    <p className="text-xs font-medium text-slate-400">
                      الطالب
                    </p>

                    <p className="mt-1 truncate text-base font-bold text-slate-900">
                      {displayedName}
                    </p>

                    {lastResult.studentId && (
                      <p className="mt-1 text-xs text-slate-400">
                        رقم الطالب:{" "}
                        <span className="font-semibold text-slate-600">
                          {
                            students.find(
                              (
                                student,
                              ) =>
                                student.id ===
                                lastResult.studentId,
                            )?.studentId ??
                            lastResult.studentId
                          }
                        </span>
                      </p>
                    )}
                  </div>

                  {displayedTime && (
                    <div className="shrink-0 text-center">
                      <FiClock
                        size={16}
                        className="mx-auto text-slate-400"
                      />

                      <p className="mt-1 text-xs font-bold text-slate-700">
                        {displayedTime}
                      </p>
                    </div>
                  )}
                </div>
              )}

              <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-center text-sm font-semibold text-slate-600">
                {lastResult.message}
              </div>
            </div>
          )}

          {scannerState ===
            "waiting" && (
            <div className="mt-8 flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-medium text-slate-500">
              <FiEdit3
                size={14}
              />
              USB Barcode Scanner
              يعمل كلوحة مفاتيح
            </div>
          )}

          <div className="mt-10 flex flex-col items-center gap-3 sm:flex-row">
            <button
              type="button"
              onClick={() => {
                setManualOpen(true);
                setManualError("");
                setManualSearch("");
              }}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
            >
              <FiSearch
                size={16}
              />
              تسجيل يدوي
            </button>

            {scannerState !==
              "waiting" &&
              scannerState !==
                "processing" && (
                <button
                  type="button"
                  onClick={
                    resetScanner
                  }
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-600 shadow-sm transition hover:bg-slate-50"
                >
                  <FiRefreshCw
                    size={15}
                  />
                  انتظار الطالب التالي
                </button>
              )}
          </div>
        </section>

        <footer className="mt-5 flex flex-col gap-2 text-center text-[11px] text-slate-400 sm:flex-row sm:items-center sm:justify-between sm:text-right">
          <span>
            نظام تسجيل حضور سريع
            — Offline Ready
          </span>

          <span>
            سيتم الرجوع تلقائيًا إلى
            انتظار المسح التالي.
          </span>
        </footer>
      </div>

      {manualOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          onClick={() =>
            setManualOpen(false)
          }
        >
          <div
            className="w-full max-w-lg overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900">
                  تسجيل يدوي
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  ابحث عن الطالب ثم سجّل حضوره.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setManualOpen(false)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
                aria-label="إغلاق"
              >
                <FiX
                  size={17}
                />
              </button>
            </div>

            <div className="p-5">
              {manualError && (
                <div
                  role="alert"
                  className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium text-red-600"
                >
                  {manualError}
                </div>
              )}

              <div className="relative">
                <FiSearch
                  size={16}
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <input
                  type="search"
                  value={
                    manualSearch
                  }
                  onChange={(
                    event,
                  ) =>
                    setManualSearch(
                      event.target.value,
                    )
                  }
                  placeholder="ابحث باسم الطالب أو رقم الطالب..."
                  autoFocus
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pr-9 pl-3 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:ring-4 focus:ring-teal-500/10"
                />
              </div>

              <div className="mt-4 max-h-80 overflow-y-auto rounded-xl border border-slate-200">
                {manualLoading ? (
                  <div className="flex min-h-40 items-center justify-center">
                    <FiRefreshCw
                      size={19}
                      className="animate-spin text-teal-600"
                    />
                  </div>
                ) : filteredManualStudents.length ===
                  0 ? (
                  <div className="flex min-h-40 flex-col items-center justify-center px-5 text-center">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <FiSearch
                        size={17}
                      />
                    </div>

                    <p className="mt-3 text-sm font-semibold text-slate-700">
                      لا توجد نتائج
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      جرّب البحث باسم آخر أو رقم الطالب.
                    </p>
                  </div>
                ) : (
                  filteredManualStudents.map(
                    (student) => {
                      const group =
                        student.groupId
                          ? groupMap.get(
                              student.groupId,
                            )
                          : undefined;

                      const disabled =
                        student.status !==
                        "active";

                      return (
                        <button
                          key={
                            student.id
                          }
                          type="button"
                          disabled={
                            disabled
                          }
                          onClick={() =>
                            void handleManualCheckIn(
                              student.id,
                            )
                          }
                          className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-right last:border-0 ${
                            disabled
                              ? "cursor-not-allowed bg-slate-50 opacity-60"
                              : "transition hover:bg-teal-50"
                          }`}
                        >
                          <div
                            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                              disabled
                                ? "bg-slate-200 text-slate-400"
                                : "bg-teal-50 text-teal-700"
                            }`}
                          >
                            {student.name.charAt(
                              0,
                            )}
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {
                                student.name
                              }
                            </p>

                            <p className="mt-1 truncate text-xs text-slate-400">
                              {
                                student.studentId
                              }

                              {group?.name
                                ? ` · ${group.name}`
                                : ""}
                            </p>
                          </div>

                          <div className="shrink-0">
                            {disabled ? (
                              <span className="rounded-lg bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-400">
                                غير نشط
                              </span>
                            ) : (
                              <FiUserCheck
                                size={16}
                                className="text-teal-500"
                              />
                            )}
                          </div>
                        </button>
                      );
                    },
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
