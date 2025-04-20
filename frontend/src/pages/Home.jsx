import React from 'react';

export default function DigitalDiner() {
  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-red-600 shadow-md">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-white text-center">The Digital Diner</h1>
          <p className="text-red-100 text-center">Fresh food, fast pickup</p>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero section */}
        <section className="mb-12 bg-yellow-50 rounded-xl overflow-hidden shadow-md">
          <div className="flex flex-col md:flex-row">
            <div className="p-6 md:p-12 md:w-1/2">
              <h2 className="text-3xl font-bold text-red-600 mb-4">Welcome to The Digital Diner</h2>
              <p className="text-lg text-gray-700 mb-6">
                We're bringing delicious homestyle cooking to the digital age. 
                Online ordering now available for pickup orders!
              </p>
              <button className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-md font-semibold transition">
                Coming Soon
              </button>
            </div>
            <div className="md:w-1/2">
              <img 
                src="/api/placeholder/600/400" 
                alt="Delicious food" 
                className="h-64 w-full object-cover md:h-full"
              />
            </div>
          </div>
        </section>

        {/* About section */}
        <section className="mb-12">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-2xl font-bold mb-4 text-center">About The Digital Diner</h2>
            <p className="text-gray-700 mb-4">
              At The Digital Diner, we combine traditional diner favorites with modern convenience. 
              Our menu features fresh, locally-sourced ingredients prepared with care by our expert chefs.
            </p>
            <p className="text-gray-700">
              We're a family-owned restaurant dedicated to providing exceptional food and service to our community.
              Soon you'll be able to browse our full menu and place pickup orders right from this website!
            </p>
          </div>
        </section>

        {/* Hours & Location */}
        <section className="mb-12 grid md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Hours</h2>
            <ul className="space-y-2 text-gray-700">
              <li className="flex justify-between">
                <span>Monday - Thursday</span>
                <span>7:00 AM - 9:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Friday - Saturday</span>
                <span>7:00 AM - 11:00 PM</span>
              </li>
              <li className="flex justify-between">
                <span>Sunday</span>
                <span>8:00 AM - 8:00 PM</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-bold mb-4">Location</h2>
            <p className="text-gray-700 mb-2">123 Main Street</p>
            <p className="text-gray-700 mb-2">Anytown, ST 12345</p>
            <p className="text-gray-700">(555) 123-4567</p>
          </div>
        </section>

             </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="mb-2">© 2025 The Digital Diner. All rights reserved.</p>
          <div className="flex justify-center space-x-4">
            <a href="#" className="hover:text-red-300">Privacy Policy</a>
            <a href="#" className="hover:text-red-300">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  );
}