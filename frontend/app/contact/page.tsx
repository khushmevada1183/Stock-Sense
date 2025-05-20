'use client';

import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { Mail, Phone, MapPin, MessageSquare, Send, Clock, CheckCircle } from 'lucide-react';
import PageBackground from '@/components/layout/PageBackground';

export default function ContactPage() {
  const mainRef = useRef(null);
  const formRef = useRef(null);
  const sectionsRef = useRef([]);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  useEffect(() => {
    // Main entrance animation
    gsap.from(mainRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.8,
      ease: "power3.out"
    });

    // Staggered sections animation
    gsap.from(sectionsRef.current, {
      opacity: 0,
      y: 30,
      stagger: 0.2,
      duration: 0.8,
      ease: "back.out(1.2)",
      delay: 0.3
    });

    // Form fields animation
    if (formRef.current) {
      gsap.from(formRef.current.querySelectorAll('input, textarea, button'), {
      opacity: 0,
      y: 20,
        stagger: 0.1,
      duration: 0.6,
        ease: "power3.out",
        delay: 0.5
    });
    }
  }, []);

  // Add sections to ref array for animations
  const addToSectionsRefs = (el) => {
    if (el && !sectionsRef.current.includes(el)) {
      sectionsRef.current.push(el);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real app, you would send the form data to your backend here
    console.log('Form submitted:', formData);
    
    // Show success message
    setFormSubmitted(true);
    
    // Reset form after submission
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    
    // Animate success message
    gsap.from('.success-message', {
          opacity: 0, 
      y: -20,
          duration: 0.5,
      ease: "back.out(1.7)"
    });
  };

  return (
    <PageBackground>
    <main 
      ref={mainRef}
        className="container mx-auto px-4 py-12"
    >
        <h1 className="text-3xl md:text-4xl font-bold text-center mb-8 text-white">
        Contact Us
      </h1>
      
        <p className="text-lg text-center text-gray-300 mb-12 max-w-3xl mx-auto">
          Have questions or need assistance? Our team is here to help you with any inquiries about our platform.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          <div 
            ref={addToSectionsRefs}
            className="lg:col-span-2 bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium"
          >
            <h2 className="text-2xl font-bold mb-6 text-white flex items-center">
              <MessageSquare className="mr-2 h-6 w-6 text-neon-400" />
              Send Us a Message
            </h2>
            
            {formSubmitted ? (
              <div className="success-message bg-neon-400/10 border border-neon-400 rounded-lg p-6 text-center">
                <CheckCircle className="h-12 w-12 text-neon-400 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-white mb-2">Thank You!</h3>
                <p className="text-gray-300">
                  Your message has been sent successfully. We&apos;ll get back to you as soon as possible.
            </p>
                <button 
                  onClick={() => setFormSubmitted(false)} 
                  className="mt-4 px-4 py-2 bg-neon-400 hover:bg-neon-300 text-black font-medium rounded-lg transition-colors shadow-neon-sm hover:shadow-neon"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                Your Name
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-neon-400 focus:border-neon-400"
                      placeholder="John Doe"
              />
            </div>
            <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                      Email Address
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                      className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-neon-400 focus:border-neon-400"
                      placeholder="john@example.com"
              />
                  </div>
            </div>
            
            <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-300 mb-1">
                Subject
              </label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-neon-400 focus:border-neon-400"
                    placeholder="How can we help you?"
              />
            </div>
            
            <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-1">
                Your Message
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                required
                    rows={6}
                    className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white focus:ring-1 focus:ring-neon-400 focus:border-neon-400"
                    placeholder="Please provide details about your inquiry..."
              ></textarea>
            </div>
            
                <div>
            <button
              type="submit"
                    className="px-6 py-3 bg-neon-400 hover:bg-neon-300 text-black font-medium rounded-lg transition-colors shadow-neon-sm hover:shadow-neon flex items-center justify-center"
            >
                    <Send className="h-4 w-4 mr-2" />
              Send Message
            </button>
                </div>
          </form>
            )}
        </div>
        
          <div ref={addToSectionsRefs}>
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium mb-6">
              <h2 className="text-xl font-bold mb-6 text-white">Contact Information</h2>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <Mail className="h-5 w-5 text-neon-400" />
            </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">Email</p>
                    <p className="text-sm text-neon-400">support@indianstockanalyzer.com</p>
        </div>
      </div>

                <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <Phone className="h-5 w-5 text-neon-400" />
              </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">Phone</p>
                    <p className="text-sm text-neon-400">+91 22-6789-0123</p>
            </div>
              </div>
              
              <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <MapPin className="h-5 w-5 text-neon-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">Address</p>
                    <p className="text-sm text-gray-400">
                      123 Financial District<br />
                      Mumbai, India 400001
                    </p>
                  </div>
              </div>
              
              <div className="flex items-start">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-neon-400" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-300">Business Hours</p>
                    <p className="text-sm text-gray-400">
                      Monday - Friday: 9:00 AM - 6:00 PM<br />
                      Saturday: 10:00 AM - 2:00 PM<br />
                      Sunday: Closed
                    </p>
                  </div>
                </div>
              </div>
              </div>
              
            <div className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium">
              <h2 className="text-xl font-bold mb-4 text-white">Connect With Us</h2>
              <div className="flex space-x-4">
                {['twitter', 'facebook', 'linkedin', 'instagram'].map((social) => (
                  <a 
                    key={social}
                    href="#" 
                    className="h-10 w-10 rounded-full bg-gray-700 flex items-center justify-center hover:bg-neon-400/20 transition-colors"
                  >
                    <span className="text-neon-400 text-lg font-bold uppercase">{social.charAt(0)}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
      </div>
      
        <div 
          ref={addToSectionsRefs}
          className="bg-gray-800 rounded-xl shadow-lg p-6 border border-gray-700 glass-premium mb-12"
        >
          <h2 className="text-2xl font-bold mb-6 text-white text-center">Frequently Asked Questions</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              {
                question: "How quickly will I receive a response?",
                answer: "We aim to respond to all inquiries within 24-48 business hours."
              },
              {
                question: "Can I schedule a demo of the platform?",
                answer: "Yes, you can request a personalized demo through the contact form above."
              },
              {
                question: "Do you offer technical support?",
                answer: "Yes, our technical support team is available Monday-Friday from 9 AM to 6 PM."
              },
              {
                question: "How can I report a bug or issue?",
                answer: "Please use the contact form and select 'Technical Issue' as the subject."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-750 p-4 rounded-lg">
                <h3 className="font-medium text-white mb-2">{faq.question}</h3>
                <p className="text-gray-300 text-sm">{faq.answer}</p>
          </div>
        ))}
        </div>
      </div>
    </main>
    </PageBackground>
  );
}
