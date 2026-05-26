import { getBookings } from "@/app/actions/booking";
import BookingsTable from "../../_components/BookingsTable";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const [upcomingBookings, pastBookings] = await Promise.all([
    getBookings(undefined, "upcoming"),
    getBookings(undefined, "past"),
  ]);
  return <BookingsTable upcomingBookings={upcomingBookings} pastBookings={pastBookings} />;
}
