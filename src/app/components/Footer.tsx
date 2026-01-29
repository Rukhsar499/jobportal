"use client";

import React from "react";

import { FaFacebookF, FaInstagram } from "react-icons/fa";
import { MdPhone, MdEmail } from "react-icons/md";

type LinkItem = {
    name: string;
    href: string;
};

type SocialItem = {
    icon: React.ReactNode;
    href: string;
    label: string;
};



const legalLinks: LinkItem[] = [
    { name: "Home", href: "/" },
    { name: "Profile", href: "/profile" },
    // { name: "Contact Us", href: "/contact" },

    // { name: "Cancellation Policy", href: "/cancellation-policy" },

];

const socialLinks: SocialItem[] = [
    { icon: <FaFacebookF />, href: "#", label: "Facebook" },
    { icon: <FaInstagram />, href: "#", label: "Instagram" },

];

const contactInfo = [
    { icon: <MdPhone />, text: "+91 234567890" },
    { icon: <MdEmail />, text: "narayanajobportal@gmail.com" },

];

const Footer: React.FC = () => {
    return (
        <footer className="bg-[#1A7EBD] text-white md:py-20 py-4">
            <div className="max-w-7xl container mx-auto px-4">
                <div className="flex flex-wrap gap-8 text-left">
                    <div className="md:w-[30%] w-full">
                        <div className="flex flex-col">
                            <h2 className="text-[#fff] mb-6 text-[21px] font-semibold">Narayana Job Portal</h2>
                            <p className="text-white text-[16px]">
                                Join a community that shapes young minds and inspires innovation. At Narayana, every teacher grows while helping students dream big. Experience a workplace filled with purpose, passion, and progress.

                            </p>
                        </div>
                    </div>
                    <div className="md:w-[10%] w-full">
                        <div className="flex flex-col items-start justify-start text-left">
                            <h2 className="text-[#fff] mb-6 text-[21px] font-semibold">Links</h2>
                            <ul className="space-y-2 text-white text-[16px]">
                                {legalLinks.map((link) => (
                                    <li key={link.name} className="flex items-center gap-2">
                                        <a href={link.href} className="hover:border-b-white hover:translate-x-1.5 hover:border-b-1 transform transition-all mb-3">
                                            {link.name}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="md:w-[30%] w-full">
                        <div className=" flex flex-col items-start justify-start text-left">
                            <h2 className="text-[#fff] mb-6 text-[21px] font-semibold">Contact Us</h2>
                            <p className="text-white text-[16px]">
                               123 Address kolkata - 700039
                            </p>
                            <div className="pt-4">
                                <ul className="space-y-2 text-white text-[16px] ">
                                    {contactInfo.map((item, index) => (
                                        <li key={index} className="flex items-center gap-2 mb-4">
                                            <span className="text-[#fff] text-lg">{item.icon}</span>
                                            {item.text}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>



                    <div className="md:w-[15%] w-full">
                        <div className="flex flex-col items-start justify-start text-left">
                            <h2 className="text-[#fff] mb-6 text-[21px] font-semibold">Social Links</h2>
                            <div className="gap-4 text-white flex">
                                {socialLinks.map((social) => (
                                    <a
                                        key={social.label}
                                        href={social.href}
                                        aria-label={social.label}
                                        className="hover:text-[#fgg] transition-colors text-xl mb-4"
                                    >
                                        {social.icon}
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>

                </div>

                <hr className="my-6 border-white/20" />
                <p className="text-center text-white text-[16px]">
                    Narayana Job Portal ©{new Date().getFullYear()} • All Rights Reserved
                </p>
            </div>
        </footer >
    );
};

export default Footer;