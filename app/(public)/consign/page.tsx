"use client";

import VehicleForm from "@/components/vehicle-form/VehicleInquiryForm";
import Image from "next/image";

export default function ConsignPage() {
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
            <span className="text-blue-400 italic">LUXURY DEALERSHIP</span>
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
          <span className="italic text-blue-500">Consignment Page</span>
        </h2>

        <p className="max-w-2xl mx-auto text-gray-600 mt-4">
          Are you looking to sell your luxury vehicle? Look no further. We are
          the largest luxury car dealership. We help you get the most value out
          of your consignment.
        </p>

        <div className="mt-12 w-full aspect-video rounded-xl overflow-hidden shadow-lg">
          <iframe
            className="w-full h-full"
            src="https://www.youtube.com/embed/ED7-mdDkaY4?si=wwPeidKi9H6X6sAK"
            title="Consignment Video"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          ></iframe>
        </div>
      </section>

      {/* ======================= BENEFITS ======================= */}
      <section className="py-20 max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 px-6">
        {/* IMAGE */}
        <div className="relative w-full h-[450px] rounded-3xl overflow-hidden shadow-lg">
          <Image
            src="/uploads/pages/benefit-car.jpg"
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
            <span className="italic text-blue-500">Many Benefits</span>
          </h2>

          <div className="mt-10 space-y-10">
            <div>
              <h3 className="text-xl font-bold flex items-center gap-3">
                <span className="text-gray-400">01</span>{" "}
                Large network of potential buyers
              </h3>
              <p className="text-gray-600 mt-2">
                We have a large network of high-end car enthusiasts browsing our
                inventory daily. Your vehicle gains instant exposure.
              </p>
            </div>

            <div>
              <h3 className="text-xl font-bold flex items-center gap-3">
                <span className="text-gray-400">02</span>
                Experienced sales professionals
              </h3>
            </div>

            <div>
              <h3 className="text-xl font-bold flex items-center gap-3">
                <span className="text-gray-400">03</span>
                Vehicle detailing and reconditioning
              </h3>
            </div>

            <div>
              <h3 className="text-xl font-bold flex items-center gap-3">
                <span className="text-gray-400">04</span>
                Tiered pricing system
              </h3>
            </div>
          </div>
        </div>
      </section>

      {/* ======================= SECOND FORM ======================= */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="relative rounded-3xl overflow-hidden shadow-lg bg-black/20">
          <Image
            src="/public/uploads/pages/consign-bottom.jpg"
            alt="Car Interior"
            fill
            className="object-cover opacity-50"
          />

          <div className="relative z-10 p-10">
            <h2 className="text-4xl font-bold text-white text-center">
              Sell Your Vehicle on Your Terms:
              <br />
              Choose the Best Way to{" "}
              <span className="italic text-blue-400">Consign with Us</span>
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
          <span className="italic text-blue-500 font-serif">with Us</span>
        </h2>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-gray-800">
          <div>
            <p className="font-bold">
              2500 West Sample Rd, Pompano Beach, FL, 33073
            </p>
            <p className="mt-2 text-gray-600">
              Mon–Fri: 9am – 7pm <br />
              Saturday 9am – 6pm <br />
              Sunday 11am – 4pm
            </p>
          </div>

          <div>
            <p className="font-bold">
              2115 Harbor Blvd, Costa Mesa, CA, 92627
            </p>
            <p className="mt-2 text-gray-600">
              Mon–Fri: 9am – 6pm <br />
              Saturday 9am – 4pm <br />
              Sunday 11am – 3pm
            </p>
          </div>

          <div>
            <p className="font-bold">
              551 S Military Trl, West Palm Beach, FL, 33415
            </p>
            <p className="mt-2 text-gray-600">
              Mon–Fri: 9am – 7pm <br />
              Saturday 9am – 6pm <br />
              Sunday 11am – 4pm
            </p>
          </div>

          <div>
            <p className="font-bold">
              17305 S. Dixie Hwy, Miami, FL, 33157
            </p>
            <p className="mt-2 text-gray-600">
              Mon–Sat: 9am – 9pm <br />
              Sunday 10am – 6pm
            </p>
          </div>

          <div>
            <p className="font-bold">
              2510 Jetport Dr, Suite B, Orlando, FL, 32809
            </p>
            <p className="mt-2 text-gray-600">(Coming Soon)</p>
          </div>

          <div>
            <p className="font-bold">
              737 Southwest Fwy, Houston, TX, 77074
            </p>
            <p className="mt-2 text-gray-600">(Coming Soon)</p>
          </div>
        </div>
      </section>
    </main>
  );
}
