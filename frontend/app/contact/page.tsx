'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { 
  MapPin, Phone, Mail, Clock, Send, CheckCircle, AlertCircle,
  Linkedin, Twitter, Facebook, Instagram, Github, Globe, User 
} from 'lucide-react';

export default function ContactPage() {
  const mainRef = useRef(null);
  const formRef = useRef(null);
  const mapRef = useRef(null);
  const cardsRef = useRef(null);
  const founderSectionRef = useRef(null);
  const [formStatus, setFormStatus] = useState({ submitted: false, error: false });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    // Main page animation
    gsap.from(mainRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out"
    });

    // Form animation
    gsap.from(formRef.current, {
      opacity: 0,
      x: -30,
      duration: 0.8,
      delay: 0.3,
      ease: "power2.out"
    });

    // Map animation
    gsap.from(mapRef.current, {
      opacity: 0,
      x: 30,
      duration: 0.8,
      delay: 0.3,
      ease: "power2.out"
    });

    // Contact cards animation with stagger
    gsap.from(cardsRef.current?.children || [], {
      opacity: 0,
      y: 20,
      stagger: 0.15,
      duration: 0.6,
      delay: 0.5,
      ease: "back.out(1.2)"
    });

    // Founder section animation
    gsap.from(founderSectionRef.current, {
      opacity: 0,
      y: 30,
      duration: 0.8,
      delay: 0.7,
      ease: "back.out(1.2)"
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate form submission
    const success = Math.random() > 0.3; // 70% chance of success
    
    if (success) {
      setFormStatus({ submitted: true, error: false });
      setFormData({ name: '', email: '', subject: '', message: '' });
    } else {
      setFormStatus({ submitted: false, error: true });
    }
    
    // Animation for success/error message
    gsap.fromTo(
      "#form-message",
      { opacity: 0, y: -20 },
      { opacity: 1, y: 0, duration: 0.5, ease: "back.out(1.7)" }
    );
    
    // Hide message after 5 seconds
    setTimeout(() => {
      if (success) {
        gsap.to("#form-message", { 
          opacity: 0, 
          duration: 0.5,
          onComplete: () => setFormStatus({ submitted: false, error: false })
        });
      } else {
        setFormStatus({ submitted: false, error: false });
      }
    }, 5000);
  };

  // Office location data
  const offices = [
    {
      city: "Mumbai",
      address: "123 Financial District, Mumbai 400001",
      phone: "+91 22-6789-0123",
      email: "mumbai@indianstockanalyzer.com",
      hours: "Mon-Fri: 9:00 AM - 6:00 PM"
    },
    {
      city: "Delhi",
      address: "456 Tech Park, New Delhi 110001",
      phone: "+91 11-6789-0123",
      email: "delhi@indianstockanalyzer.com",
      hours: "Mon-Fri: 9:30 AM - 6:30 PM"
    },
    {
      city: "Bangalore",
      address: "789 Innovation Hub, Bangalore 560001",
      phone: "+91 80-6789-0123",
      email: "bangalore@indianstockanalyzer.com",
      hours: "Mon-Fri: 9:00 AM - 6:00 PM"
    }
  ];

  // Founder contact information
  const founderContact = {
    name: "Khush Mevada",
    role: "Founder & CEO",
    phone: "+91-8733033853",
    email: "khushmevadal183@gmail.com",
    linkedin: "linkedin.com/in/khush-mevada-a880a7222",
    github: "github.com/khushmevadal183",
    portfolio: "khushmevadal183.github.io/portfolio"
  };

  return (
    <main 
      ref={mainRef}
      className="container mx-auto px-4 py-12 min-h-screen"
    >
      <h1 className="text-3xl md:text-4xl font-bold text-center mb-8">
        Contact Us
      </h1>
      
      <p className="text-lg text-center text-gray-700 dark:text-gray-300 mb-12 max-w-3xl mx-auto">
        Have questions about our services? Want to learn more about how Indian Stock Analyzer can help you?
        Our team is ready to assist you.
      </p>

      {/* Founder Contact Section */}
      <section 
        ref={founderSectionRef}
        className="mb-16 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-xl overflow-hidden"
      >
        <div className="p-8 md:p-12 flex flex-col md:flex-row items-center md:items-start gap-8">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border-4 border-white/30">
            <User className="w-16 h-16 md:w-24 md:h-24 text-white" />
          </div>
          <div className="text-white text-center md:text-left">
            <h2 className="text-2xl md:text-3xl font-bold mb-2">Contact the Founder</h2>
            <p className="text-xl font-medium text-blue-100 mb-6">{founderContact.name} — {founderContact.role}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-8 max-w-2xl">
              <div className="flex items-center">
                <Phone className="w-5 h-5 mr-3 flex-shrink-0" />
                <a href={`tel:${founderContact.phone}`} className="hover:underline">
                  {founderContact.phone}
                </a>
              </div>
              
              <div className="flex items-center">
                <Mail className="w-5 h-5 mr-3 flex-shrink-0" />
                <a href={`mailto:${founderContact.email}`} className="hover:underline">
                  {founderContact.email}
                </a>
              </div>
              
              <div className="flex items-center">
                <Linkedin className="w-5 h-5 mr-3 flex-shrink-0" />
                <a href={`https://${founderContact.linkedin}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  LinkedIn Profile
                </a>
              </div>
              
              <div className="flex items-center">
                <Github className="w-5 h-5 mr-3 flex-shrink-0" />
                <a href={`https://${founderContact.github}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  GitHub Profile
                </a>
              </div>
              
              <div className="flex items-center md:col-span-2">
                <Globe className="w-5 h-5 mr-3 flex-shrink-0" />
                <a href={`https://${founderContact.portfolio}`} target="_blank" rel="noopener noreferrer" className="hover:underline">
                  Portfolio Website
                </a>
              </div>
            </div>
            
            <p className="mt-6 text-blue-100 max-w-2xl">
              Feel free to reach out directly for partnership opportunities, speaking engagements, 
              or any strategic inquiries. For general support and customer service, please use the contact form below.
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
        <div ref={formRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-200 dark:border-gray-700">
          <h2 className="text-2xl font-bold mb-6">Send Us a Message</h2>
          
          {/* Form status message */}
          {(formStatus.submitted || formStatus.error) && (
            <div 
              id="form-message"
              className={`p-4 mb-6 rounded-lg ${
                formStatus.submitted 
                  ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400' 
                  : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
              }`}
            >
              <div className="flex items-start">
                {formStatus.submitted ? (
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 mr-3 flex-shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-medium">
                    {formStatus.submitted 
                      ? 'Thank you for your message!' 
                      : 'There was a problem submitting your message.'}
                  </p>
                  <p className="mt-1 text-sm">
                    {formStatus.submitted 
                      ? 'We\'ll get back to you as soon as possible.' 
                      : 'Please try again or contact us directly via email.'}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="subject" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div>
              <label htmlFor="message" className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md shadow-sm flex items-center justify-center transition-colors"
            >
              <Send className="w-4 h-4 mr-2" />
              Send Message
            </button>
          </form>
        </div>
        
        <div ref={mapRef} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="h-96 bg-gray-100 dark:bg-gray-700 p-4 flex items-center justify-center">
            <div className="text-center">
              <MapPin className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
              <p className="text-gray-500 dark:text-gray-400">
                Interactive map will be displayed here
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="text-2xl font-bold mb-6 text-center">Our Offices</h2>
      <div 
        ref={cardsRef}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
      >
        {offices.map((office) => (
          <div 
            key={office.city}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex flex-col items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-2">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold">{office.city}</h3>
            </div>
            
            <div className="space-y-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-start">
                <MapPin className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>{office.address}</span>
              </div>
              
              <div className="flex items-start">
                <Phone className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>{office.phone}</span>
              </div>
              
              <div className="flex items-start">
                <Mail className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>{office.email}</span>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                <span>{office.hours}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      <div className="bg-[#1a2332] dark:bg-[#1a2332] rounded-xl shadow-lg p-8 border border-gray-700 mb-16">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">Connect With Us</h2>
        <div className="flex justify-center space-x-6">
          <a href={`https://${founderContact.linkedin}`} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#1e2c44] rounded-full flex items-center justify-center text-blue-400 hover:bg-[#263654] transition-colors">
            <Linkedin className="w-7 h-7" />
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#1e2c44] rounded-full flex items-center justify-center text-blue-400 hover:bg-[#263654] transition-colors">
            <Twitter className="w-7 h-7" />
          </a>
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#1e2c44] rounded-full flex items-center justify-center text-blue-400 hover:bg-[#263654] transition-colors">
            <Facebook className="w-7 h-7" />
          </a>
          <a href="https://www.instagram.com/khxsh.11/" target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#1e2c44] rounded-full flex items-center justify-center text-blue-400 hover:bg-[#263654] transition-colors">
            <Instagram className="w-7 h-7" />
          </a>
          <a href={`https://${founderContact.github}`} target="_blank" rel="noopener noreferrer" className="w-14 h-14 bg-[#1e2c44] rounded-full flex items-center justify-center text-blue-400 hover:bg-[#263654] transition-colors">
            <Github className="w-7 h-7" />
          </a>
        </div>
      </div>
    </main>
  );
}
