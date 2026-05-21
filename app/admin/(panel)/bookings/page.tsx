import { getBookings } from "@/app/actions/booking";
import BookingsTable from "../../_components/BookingsTable";

export const dynamic = "force-dynamic";

export default async function BookingsPage() {
  const bookings = await getBookings();
  return <BookingsTable bookings={bookings} />;
}
