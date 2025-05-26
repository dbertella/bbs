import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import itLocale from "@fullcalendar/core/locales/it";

type DayCellContentArg = {
  date: Date;
  dayNumberText: string;
  isPast: boolean;
  isFuture: boolean;
  isToday: boolean;
  isOther: boolean;
  resource?: object;
  view: { type: string };
};

export default function Calendar() {
  const [events, setEvents] = useState([]);

  const fetchEvents = async () => {
    try {
      console.log("fetchEvents");
      const response = await fetch("/api/event");
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      const data = await response.json();
      console.log(data);
      setEvents(data);
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const renderDayCellContent = (dayCellContent: DayCellContentArg) => {
    if (dayCellContent.view.type !== "dayGridMonth") return;

    return (
      <>
        <span>{dayCellContent.date.getDate()}</span>
      </>
    );
  };

  return (
    <div className="demo-app-main">
      <FullCalendar
        plugins={[dayGridPlugin]}
        headerToolbar={{
          left: "",
          center: "title",
        }}
        initialView="dayGridMonth"
        dayMaxEvents={true}
        events={events}
        dayCellContent={renderDayCellContent}
        businessHours={true}
        fixedWeekCount={false}
        locale={itLocale}
        eventDisplay={"block"}
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
        }}
      />
    </div>
  );
}
