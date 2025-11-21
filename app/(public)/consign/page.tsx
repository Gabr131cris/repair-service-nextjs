"use client";

import { useState } from "react";
import VehicleForm from "@/components/vehicle-form/VehicleInquiryForm";
import Image from "next/image";

// =============================================
// BENEFITS DATA
// =============================================
const benefits = [
  {
    id: 1,
    title: "Large network of potential buyers",
    text: `First and foremost, we have a large network of potential buyers. As the largest luxury dealership in the state, we have a constant stream of high-end car enthusiasts coming through our doors and browsing our inventory. This means that your vehicle will be seen by a large audience, increasing the chances of a successful sale.`,
  },
  {
    id: 2,
    title: "Experienced sales professionals",
    text: `In addition to our wide reach, we also have a team of experienced sales professionals on hand to represent your vehicle. Our team is trained to showcase the unique features and benefits of each consigned vehicle, and to negotiate the best possible price on your behalf. We handle all aspects of the sales process, from fielding inquiries to closing the deal, so you can sit back and relax while we take care of everything.`,
  },
  {
    id: 3,
    title: "Vehicle detailing and reconditioning",
    text: `We don’t just stop at the sale. We also offer a range of services to help you prepare your vehicle for consignment. This includes professional detailing and reconditioning, as well as assistance with obtaining any necessary repairs or maintenance. We want to make sure your vehicle is presented in the best possible condition, to maximize its value and appeal to buyers.`,
  },
  {
    id: 4,
    title: "Tiered pricing system",
    text: `Another advantage of consigning with us is our competitive consignment fee structure. We offer a tiered pricing system based on the sale price of the vehicle, which means you only pay a percentage of the final sale price. This allows you to keep more of the profits from the sale of your vehicle.

But our value proposition goes beyond just the financial aspect. We also pride ourselves on our exceptional customer service and transparent communication. Our team is dedicated to keeping you informed throughout the entire consignment process and answering any questions you may have. We want to make the process as seamless and stress-free as possible for you.`,
  },
];

export default function ConsignPage() {
  const [active, setActive] = useState(1);

  return (
    <main className="w-full bg-white text-gray-900">

      {/* ======================= HERO ======================= */}
      <section className="relative w-full h-[80vh] min-h-[600px] flex items-center justify-center">
        <Image
          src="/images/hero-consign.jpg"
          alt="Consign Hero"
          fill
          className="object-cover"
          priority
        />

        <div className="absolute inset-0 bg-black/40" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight">
            CONSIGN WITH THE LARGEST <br />
            <span className="text-yellow-400 italic">LUXURY DEALERSHIP</span>
          </h1>

          <div className="mt-10">
            <VehicleForm />
          </div>
        </div>
      </section>

      {/* ======================= INTRO VIDEO ======================= */}
      <section className="py-20 max-w-5xl mx-auto text-center px-6">
        <h2 className="text-4xl font-bold">
          Welcome to our new{" "}
          <span className="italic text-yellow-500">Consignment Page</span>
        </h2>

        <p className="max-w-2xl mx-auto text-gray-600 mt-4">
          Are you looking to sell your luxury vehicle? Look no further.
          We are the largest luxury car dealership. We help you get the most
          value out of your consignment.
        </p>

        <div className="mt-12 w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/z2yCk8XGGo8"
            title="Consignment Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* ======================= BENEFITS ======================= */}
      <section className="py-24 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">

        {/* IMAGE */}
        <div className="relative w-full h-[480px] rounded-3xl overflow-hidden shadow-lg">
          <Image
            src="/uploads/pages/benefit-car.webp"
            alt="Interior Car"
            fill
            className="object-cover"
          />
        </div>

        {/* LIST */}
        <div>
          <h2 className="text-4xl font-bold leading-tight">
            Consigning your vehicle <br />
            with us has{" "}
            <span className="italic text-yellow-500">Many Benefits</span>
          </h2>

          {/* Vertical line */}
          <div className="relative mt-10">
            <div className="absolute left-0 top-0 h-full w-[3px] bg-gray-200"></div>

            {/* Moving yellow bar */}
            <div
              className="absolute left-0 w-[3px] bg-yellow-400 transition-all duration-300"
              style={{ top: `${(active - 1) * 120}px`, height: "90px" }}
            />

            {/* BENEFIT ITEMS */}
            <div className="pl-8 space-y-10">
              {benefits.map((b) => (
                <div key={b.id}>
                  <button
                    onClick={() => setActive(b.id)}
                    className="flex items-center gap-4 text-left w-full"
                  >
                    <span
                      className={`text-xl font-semibold ${
                        active === b.id ? "text-black" : "text-gray-400"
                      }`}
                    >
                      {String(b.id).padStart(2, "0")}
                    </span>

                    <span
                      className={`text-xl font-bold transition ${
                        active === b.id ? "text-black" : "text-gray-700"
                      }`}
                    >
                      {b.title}
                    </span>
                  </button>

                  {active === b.id && (
                    <p className="mt-3 text-gray-600 animate-fadeIn">
                      {b.text}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECOND FORM ======================= */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden shadow-lg bg-black/40">
          <Image
            src="/uploads/pages/consign-bottom.webp"
            alt="Car Interior"
            fill
            className="object-cover opacity-40"
          />

          <div className="relative z-10 p-10">
            <h2 className="text-4xl font-bold text-white text-center">
              Sell Your Vehicle on Your Terms:
              <br />
              Choose the Best Way to{" "}
              <span className="italic text-yellow-400">Consign with Us</span>
            </h2>

            <p className="text-gray-200 text-center max-w-2xl mx-auto mt-4">
              Our team is ready to help you get the most out of your vehicle.
              Contact us today to get started.
            </p>

            <div className="mt-10">
              <VehicleForm />
            </div>
          </div>
        </div>
      </section>

      {/* ======================= CONTACT SECTION ======================= */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <h2 className="text-4xl text-center font-bold">
          Contact{" "}
          <span className="italic text-yellow-500 font-serif">with Us</span>
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-gray-800">
          <div>
            <p className="font-bold">
              2500 West Sample Rd, Pompano Beach, FL, 33073
            </p>
            <p className="mt-2 text-gray-600">Mon–Fri: 9am – 7pm <br /> Saturday 9am – 6pm <br /> Sunday 11am – 4pm</p>
          </div>

          <div>
            <p className="font-bold">2115 Harbor Blvd, Costa Mesa, CA, 92627</p>
            <p className="mt-2 text-gray-600">Mon–Fri: 9am – 6pm <br /> Saturday 9am – 4pm <br /> Sunday 11am – 3pm</p>
          </div>

          <div>
            <p className="font-bold">551 S Military Trl, West Palm Beach, FL, 33415</p>
            <p className="mt-2 text-gray-600">Mon–Fri: 9am – 7pm <br /> Saturday 9am – 6pm <br /> Sunday 11am – 4pm</p>
          </div>

          <div>
            <p className="font-bold">17305 S. Dixie Hwy, Miami, FL, 33157</p>
            <p className="mt-2 text-gray-600">Mon–Sat: 9am – 9pm <br /> Sunday 10am – 6pm</p>
          </div>

          <div>
            <p className="font-bold">2510 Jetport Dr, Suite B, Orlando, FL, 32809</p>
            <p className="mt-2 text-gray-600">(Coming Soon)</p>
          </div>

          <div>
            <p className="font-bold">737 Southwest Fwy, Houston, TX, 77074</p>
            <p className="mt-2 text-gray-600">(Coming Soon)</p>
          </div>
        </div>
      </section>

    </main>
  );
}
