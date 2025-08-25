'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Copy, Mail, Lock } from 'lucide-react';

export default function DummyLogin() {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const dummyData = {
    user: {
      email: 'hehiyo8176@iotrama.com',
      password: 'hehiyo8176@iotrama.com'
    },
    hospital: {
      email: 'dalara9746@chaublog.com',
      password: 'dalara9746@chaublog.com'
    },
    responder: {
      email: 'pofar66571@iotrama.com',
      password: 'pofar66571@iotrama.com'
    }
  };

  const handleCopy = async (text: string, field: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Open Dummy Login</Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-base sm:text-lg">
            Dummy Login Details (for testing only)
          </DialogTitle>
          <p className="text-xs text-gray-500">Both email and password are the same</p>
        </DialogHeader>

        <Tabs defaultValue="user" className="w-full">
          <TabsList className="grid w-full grid-cols-3 text-xs sm:text-sm overflow-x-auto no-scrollbar">
            <TabsTrigger value="user">User</TabsTrigger>
            <TabsTrigger value="hospital">Hospital</TabsTrigger>
            <TabsTrigger value="responder">Responder</TabsTrigger>
          </TabsList>

          {Object.entries(dummyData).map(([key, creds]) => (
            <TabsContent key={key} value={key} className="space-y-4 pt-4">
              {/* Email */}
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" /> Email
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input readOnly value={creds.email} className="flex-1" />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleCopy(creds.email, `${key}-email`)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copiedField === `${key}-email` && (
                  <p className="text-xs text-green-600">Email copied!</p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" /> Password
                </label>
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                  <Input readOnly value={creds.password} type="text" className="flex-1" />
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => handleCopy(creds.password, `${key}-password`)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                {copiedField === `${key}-password` && (
                  <p className="text-xs text-green-600">Password copied!</p>
                )}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
