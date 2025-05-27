import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import itLocale from "@fullcalendar/core/locales/it";
import { formatHouseName } from "../utils/house";

interface Booking {
  id: string;
  house: string;
  dateFrom: string;
  dateTo: string;
  userId: string;
}

interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  backgroundColor: string;
  borderColor: string;
  textColor: string;
  url: string;
}

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
  const [events, setEvents] = useState<CalendarEvent[]>([]);

  console.log(events);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await fetch("/api/bookings");
        if (!response.ok) {
          throw new Error("Failed to fetch bookings");
        }
        const bookings: Booking[] = await response.json();
        
        const calendarEvents = bookings.map((booking) => {
          const start = new Date(booking.dateFrom);
          const end = new Date(booking.dateTo);
          const now = new Date();
          const isUpcoming = start > now;
          const isPast = end < now;
          
          // Color based on house and status
          let color;
          if (isPast) {
            color = '#6B7280'; // gray-500
          } else if (isUpcoming) {
            color = booking.house === 'SERRA' ? '#3B82F6' : '#10B981'; // blue-500 for Serra, emerald-500 for Solaro
          } else {
            color = booking.house === 'SERRA' ? '#2563EB' : '#059669'; // blue-600 for Serra, emerald-600 for Solaro
          }

          return {
            id: booking.id,
            title: formatHouseName(booking.house),
            start,
            end,
            backgroundColor: color,
            borderColor: color,
            textColor: '#ffffff',
            url: `/bookings/${booking.id}`
          };
        });

        setEvents(calendarEvents);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      }
    };

    fetchBookings();
  }, []);

  const renderDayCellContent = (dayCellContent: DayCellContentArg) => {
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
        editable={false}
        headerToolbar={{
          left: "",
          center: "title",
        }}
        initialView="dayGridMonth"
        dayMaxEvents={false}
        events={events}
        dayCellContent={renderDayCellContent}
        businessHours={true}
        fixedWeekCount={false}
        locale={itLocale}
        eventDisplay="block"
        eventTimeFormat={{
          hour: "2-digit",
          minute: "2-digit",
          meridiem: false,
        }}
        height="auto"
        eventContent={(arg) => {
          return (
            <div className="p-1 overflow-hidden">
              <div className="text-sm font-medium whitespace-normal">
                {arg.event.title}
              </div>
            </div>
          )
        }}
      />
    </div>
  );
}
