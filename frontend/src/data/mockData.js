export const stats = [
  { label: "Bookings Completed", value: "12.4k", detail: "+18% this semester" },
  { label: "Partner Garages", value: "240+", detail: "Verified service stations" },
  { label: "Customer Satisfaction", value: "96%", detail: "Based on live feedback" },
  { label: "Average Response", value: "08 min", detail: "Smart garage matching" }
];

export const services = [
  {
    title: "Engine Diagnostics",
    description: "Quick fault detection with transparent repair estimates and digital reports."
  },
  {
    title: "Periodic Maintenance",
    description: "Oil, filters, tuning, and preventive service schedules customized to your vehicle."
  },
  {
    title: "Emergency Repair Slots",
    description: "Fast-track bookings for urgent vehicle issues with real-time garage availability."
  }
];

export const garages = [
  {
    id: 1,
    name: "Prime Auto Garage",
    city: "Karachi",
    rating: 4.9,
    specialty: "Engine, suspension, diagnostics",
    availability: "Open today"
  },
  {
    id: 2,
    name: "Metro Service Point",
    city: "Lahore",
    rating: 4.8,
    specialty: "Routine maintenance, wheel care",
    availability: "Limited slots"
  },
  {
    id: 3,
    name: "Torque Masters",
    city: "Islamabad",
    rating: 4.7,
    specialty: "Electrical systems, AC, detailing",
    availability: "Open today"
  }
];

export const vehicles = [
  { id: "VH-1201", owner: "Rohit Kumar", model: "Honda Civic 2020", plate: "BGL-245", status: "Active" },
  { id: "VH-1202", owner: "Ali Khan", model: "Toyota Corolla 2019", plate: "LEA-992", status: "In Service" }
];

export const bookings = [
  { id: "BK-301", customer: "Rohit Kumar", garage: "Prime Auto Garage", service: "Engine Diagnostics", date: "2026-04-19", status: "Confirmed" },
  { id: "BK-302", customer: "Sana Malik", garage: "Metro Service Point", service: "Oil Change", date: "2026-04-20", status: "Pending" },
  { id: "BK-303", customer: "Hassan Ahmed", garage: "Torque Masters", service: "Brake Repair", date: "2026-04-21", status: "Completed" }
];

export const feedback = [
  { id: 1, user: "Rohit Kumar", garage: "Prime Auto Garage", rating: 5, comment: "Professional service with transparent updates." },
  { id: 2, user: "Sana Malik", garage: "Metro Service Point", rating: 4, comment: "Smooth booking flow and timely maintenance." }
];

export const adminOverview = [
  { label: "Registered Users", value: "4,320" },
  { label: "Active Garages", value: "184" },
  { label: "Bookings Today", value: "126" },
  { label: "Pending Approvals", value: "09" }
];
