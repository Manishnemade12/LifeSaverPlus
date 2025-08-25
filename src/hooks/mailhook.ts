// src/utils/mailhook.ts

import emailjs from "@emailjs/browser";
import { supabase } from "@/integrations/supabase/client";

export const sendSOSMail = async (
  messageType: "medical" | "safety" | "general"
): Promise<void> => {
  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const latitude = pos.coords.latitude.toFixed(6);
        const longitude = pos.coords.longitude.toFixed(6);
        const locationLink = `https://www.google.com/maps?q=${latitude},${longitude}`;

        // 1. Get logged-in user
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user) {
          console.error("❌ User not found", userError);
          reject("User not authenticated");
          return;
        }

        // 2. Get all emergency emails for this user
        const { data: contacts, error: contactsError } = await supabase
          .from("emergency_contacts")
          .select("email")
          .eq("user_id", user.id);

        if (contactsError || !contacts?.length) {
          console.error("❌ No emergency contacts found", contactsError);
          reject("No emergency emails found");
          return;
        }

        // 3. Filter valid unique emails
        const emails = Array.from(
          new Set(contacts.map((c) => c.email).filter(Boolean))
        );

        // 4. Send mail to each email via EmailJS
        for (const email of emails) {
          const templateParams = {
            to_email: email,
            latitude,
            longitude,
            location_link: locationLink,
            message_type: messageType.toUpperCase() + " SOS",
          };

          try {
            await emailjs.send(
              import.meta.env.VITE_EMAILJS_SERVICE_ID,
              import.meta.env.VITE_EMAILJS_TEMPLATE_ID,
              templateParams,
              import.meta.env.VITE_EMAILJS_PUBLIC_KEY
            );
          } catch (mailError) {
            console.error(`❌ Error sending to ${email}`, mailError);
            // Don't reject here; just log the error and continue
          }
        }

        resolve(); // All attempts done
      },
      (err) => {
        console.error("❌ Location error:", err);
        reject(err);
      }
    );
  });
};
