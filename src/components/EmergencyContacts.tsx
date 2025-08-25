"use client"

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { TabsContent } from "@/components/ui/tabs";
import { Phone } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type Contact = {
  id: string;
  name: string;
  phone: string;
  email: string;
};

export default function EmergencyContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [newContact, setNewContact] = useState({ name: "", phone: "", email: "" });
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data, error } = await supabase
      .from("emergency_contacts")
      .select("*")
      .eq("user_id", user.id);

    if (!error && data) setContacts(data as Contact[]);
  };

  const addContact = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase.from("emergency_contacts").insert([
      {
        ...newContact,
        user_id: user.id,
      },
    ]);

    if (!error) {
      setNewContact({ name: "", phone: "", email: "" });
      fetchContacts();
    }
  };

  const updateContact = async () => {
    if (!editingId) return;

    const { error } = await supabase
      .from("emergency_contacts")
      .update({ ...newContact })
      .eq("id", editingId);

    if (!error) {
      setEditingId(null);
      setNewContact({ name: "", phone: "", email: "" });
      fetchContacts();
    }
  };

  const removeContact = async (id: string) => {
    const { error } = await supabase.from("emergency_contacts").delete().eq("id", id);
    if (!error) fetchContacts();
  };

  const callContact = (phone: string) => {
    window.open(`tel:${phone}`);
  };

  const handleEdit = (contact: Contact) => {
    setEditingId(contact.id);
    setNewContact({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
    });
  };

  return (
    <TabsContent value="contacts" className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Emergency Contacts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Add/Update Contact Form */}
            <div className="grid md:grid-cols-4 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label htmlFor="contactName">Name</Label>
                <Input
                  id="contactName"
                  value={newContact.name}
                  onChange={(e) => setNewContact({ ...newContact, name: e.target.value })}
                  placeholder="Contact name"
                />
              </div>
              <div>
                <Label htmlFor="contactPhone">Phone</Label>
                <Input
                  id="contactPhone"
                  value={newContact.phone}
                  onChange={(e) => setNewContact({ ...newContact, phone: e.target.value })}
                  placeholder="+91-XXXXXXXXXX"
                />
              </div>
              <div>
                <Label htmlFor="contactEmail">Email</Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={newContact.email}
                  onChange={(e) => setNewContact({ ...newContact, email: e.target.value })}
                  placeholder="example@email.com"
                />
              </div>
              <div className="flex items-end">
                {editingId ? (
                  <Button onClick={updateContact} className="w-full">
                    Update Contact
                  </Button>
                ) : (
                  <Button onClick={addContact} className="w-full">
                    Add Contact
                  </Button>
                )}
              </div>
            </div>

            {/* Contact List */}
          <div className="space-y-2">
  {contacts.map((contact) => (
    <div
      key={contact.id}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 border rounded-lg overflow-x-auto"
    >
      <div className="min-w-0">
        <p className="font-semibold break-words">{contact.name}</p>
        <p className="text-gray-600 break-words">{contact.phone}</p>
        <p className="text-gray-600 break-words">{contact.email}</p>
      </div>
      <div className="flex flex-wrap gap-2 sm:space-x-2">
        <Button
          size="sm"
          onClick={() => callContact(contact.phone)}
          className="bg-green-600 hover:bg-green-700"
        >
          <Phone className="h-4 w-4" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => handleEdit(contact)}
        >
          Edit
        </Button>
        <Button
          size="sm"
          variant="destructive"
          onClick={() => removeContact(contact.id)}
        >
          Remove
        </Button>
      </div>
    </div>
  ))}
</div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  );
}
