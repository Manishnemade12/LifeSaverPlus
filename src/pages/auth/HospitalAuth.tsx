
// // import { useState } from 'react';
// // import { useNavigate } from 'react-router-dom';
// // import { useAuth } from '@/hooks/useAuth';
// // import { Button } from '@/components/ui/button';
// // import { Input } from '@/components/ui/input';
// // import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// // import { useToast } from '@/hooks/use-toast';
// // import { Building2, Mail, Lock, User, Phone, MapPin } from 'lucide-react';

// // const HospitalAuth = () => {
// //   const [isSignUp, setIsSignUp] = useState(false);
// //   const [email, setEmail] = useState('');
// //   const [password, setPassword] = useState('');
// //   const [firstName, setFirstName] = useState('');
// //   const [lastName, setLastName] = useState('');
// //   const [phone, setPhone] = useState('');
// //   const [hospitalName, setHospitalName] = useState('');
// //   const [hospitalAddress, setHospitalAddress] = useState('');
// //   const [loading, setLoading] = useState(false);
  
// //   const { signIn, signUp } = useAuth();
// //   const navigate = useNavigate();
// //   const { toast } = useToast();

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     setLoading(true);

// //     try {
// //       if (isSignUp) {
// //         const { error } = await signUp(email, password, {
// //           first_name: firstName,
// //           last_name: lastName,
// //           phone,
// //           user_type: 'hospital',
// //           hospital_name: hospitalName,
// //           hospital_address: hospitalAddress
// //         });

// //         if (error) {
// //           toast({
// //             title: "Registration Failed",
// //             description: error.message,
// //             variant: "destructive"
// //           });
// //         } else {
// //           toast({
// //             title: "Registration Successful",
// //             description: "Please check your email to verify your account."
// //           });
// //           setIsSignUp(false);
// //         }
// //       } else {
// //         const { error } = await signIn(email, password);
        
// //         if (error) {
// //           toast({
// //             title: "Login Failed", 
// //             description: error.message,
// //             variant: "destructive"
// //           });
// //         } else {
// //           navigate('/dashboard/hospital');
// //         }
// //       }
// //     } catch (error: any) {
// //       toast({
// //         title: "Error",
// //         description: error.message || "An unexpected error occurred",
// //         variant: "destructive"
// //       });
// //     }
    
// //     setLoading(false);
// //   };

// //   return (
// //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
// //       <Card className="w-full max-w-md">
// //         <CardHeader className="text-center">
// //           <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
// //             <Building2 className="h-6 w-6 text-white" />
// //           </div>
// //           <CardTitle className="text-2xl text-blue-900">
// //             {isSignUp ? 'Hospital Registration' : 'Hospital Login'}
// //           </CardTitle>
// //           <CardDescription>
// //             {isSignUp 
// //               ? 'Register your hospital to join our emergency response network'
// //               : 'Access your hospital dashboard'
// //             }
// //           </CardDescription>
// //         </CardHeader>
// //         <CardContent>
// //           <form onSubmit={handleSubmit} className="space-y-4">
// //             {isSignUp && (
// //               <>
// //                 <div className="grid grid-cols-2 gap-4">
// //                   <div className="relative">
// //                     <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
// //                     <Input
// //                       placeholder="First Name"
// //                       value={firstName}
// //                       onChange={(e) => setFirstName(e.target.value)}
// //                       className="pl-10"
// //                       required={isSignUp}
// //                     />
// //                   </div>
// //                   <div className="relative">
// //                     <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
// //                     <Input
// //                       placeholder="Last Name"
// //                       value={lastName}
// //                       onChange={(e) => setLastName(e.target.value)}
// //                       className="pl-10"
// //                       required={isSignUp}
// //                     />
// //                   </div>
// //                 </div>

// //                 <div className="relative">
// //                   <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
// //                   <Input
// //                     placeholder="Phone Number"
// //                     value={phone}
// //                     onChange={(e) => setPhone(e.target.value)}
// //                     className="pl-10"
// //                     required={isSignUp}
// //                   />
// //                 </div>

// //                 <div className="relative">
// //                   <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
// //                   <Input
// //                     placeholder="Hospital Name"
// //                     value={hospitalName}
// //                     onChange={(e) => setHospitalName(e.target.value)}
// //                     className="pl-10"
// //                     required={isSignUp}
// //                   />
// //                 </div>

// //                 <div className="relative">
// //                   <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
// //                   <Input
// //                     placeholder="Hospital Address"
// //                     value={hospitalAddress}
// //                     onChange={(e) => setHospitalAddress(e.target.value)}
// //                     className="pl-10"
// //                     required={isSignUp}
// //                   />
// //                 </div>
// //               </>
// //             )}

// //             <div className="relative">
// //               <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
// //               <Input
// //                 type="email"
// //                 placeholder="Email"
// //                 value={email}
// //                 onChange={(e) => setEmail(e.target.value)}
// //                 className="pl-10"
// //                 required
// //               />
// //             </div>

// //             <div className="relative">
// //               <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
// //               <Input
// //                 type="password"
// //                 placeholder="Password"
// //                 value={password}
// //                 onChange={(e) => setPassword(e.target.value)}
// //                 className="pl-10"
// //                 required
// //               />
// //             </div>

// //             <Button 
// //               type="submit" 
// //               className="w-full bg-blue-600 hover:bg-blue-700"
// //               disabled={loading}
// //             >
// //               {loading ? 'Processing...' : (isSignUp ? 'Register Hospital' : 'Login')}
// //             </Button>
// //           </form>

// //           <div className="mt-4 text-center">
// //             <Button
// //               variant="link"
// //               onClick={() => setIsSignUp(!isSignUp)}
// //               className="text-blue-600"
// //             >
// //               {isSignUp 
// //                 ? 'Already have an account? Login here'
// //                 : 'Need to register your hospital? Sign up here'
// //               }
// //             </Button>
// //           </div>

// //           <div className="mt-4 text-center">
// //             <Button
// //               variant="link"
// //               onClick={() => navigate('/')}
// //               className="text-gray-600"
// //             >
// //               Back to Home
// //             </Button>
// //           </div>
// //         </CardContent>
// //       </Card>
// //     </div>
// //   );
// // };

// // export default HospitalAuth;
// import { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { supabase } from '@/integrations/supabase/client';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
// import { useToast } from '@/hooks/use-toast';
// import { Building2, Mail, Lock, Phone, MapPin, User } from 'lucide-react';

// const HospitalAuth = () => {
//   const [isSignUp, setIsSignUp] = useState(false);
//   const [email, setEmail] = useState('');
//   const [password, setPassword] = useState('');
//   const [hospitalName, setHospitalName] = useState('');
//   const [address, setAddress] = useState('');
//   const [phone, setPhone] = useState('');
//   const [contactPerson, setContactPerson] = useState('');
//   const [latitude, setLatitude] = useState('');
//   const [longitude, setLongitude] = useState('');
//   const [capacity, setCapacity] = useState('');
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // On login, fetch hospital profile for the logged-in user
//   useEffect(() => {
//     const fetchHospitalProfile = async () => {
//       const { data: { user } } = await supabase.auth.getUser();
//       if (user) {
//         // Find hospital profile by email (or you can use user.id if you store it as id)
//         const { data: hospital, error } = await supabase
//           .from('hospital_profiles')
//           .select('*')
//           .eq('email', user.email)
//           .single();
//         if (hospital) {
//           navigate('/dashboard/hospital');
//         }
//       }
//     };
//     fetchHospitalProfile();
//     // eslint-disable-next-line
//   }, []);




// const handleSubmit = async (e: React.FormEvent) => {
//   e.preventDefault();
//   setLoading(true);

//   try {
//     if (isSignUp) {
//       // 1. Register with Supabase Auth
//       const { data, error: signUpError } = await supabase.auth.signUp({
//         email,
//         password,
//       });

//       if (signUpError) {
//         toast({
//           title: "Registration Failed",
//           description: signUpError.message,
//           variant: "destructive"
//         });
//         setLoading(false);
//         return;
//       }

//       const userId = data.user?.id;

//       // 2. Insert hospital profile
//       const { error: insertHospitalError } = await supabase
//         .from('hospital_profiles')
//         .insert([{
//           email,
//           hospital_name: hospitalName,
//           address,
//           phone,
//           contact_person: contactPerson,
//           latitude: Number(latitude),
//           longitude: Number(longitude),
//           capacity: capacity ? Number(capacity) : 0,
//           id: userId // optional, only if you want to match it with auth.user.id
//         }]);

//       // 3. Update role in profiles table
//       const { error: updateRoleError } = await supabase
//         .from('profiles')
//         .update({ user_type: 'hospital' })
//         .eq('id', userId);

//       if (insertHospitalError || updateRoleError) {
//         toast({
//           title: "Profile Creation Failed",
//           description: insertHospitalError?.message || updateRoleError?.message,
//           variant: "destructive"
//         });
//       } else {
//         toast({
//           title: "Registration Successful",
//           description: "Please check your email to verify your account."
//         });
//         setIsSignUp(false);
//       }

//     } else {
//       // Login with Supabase Auth
//       const { error: signInError } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (signInError) {
//         toast({
//           title: "Login Failed",
//           description: signInError.message,
//           variant: "destructive"
//         });
//       } else {
//         // Fetch hospital profile and redirect
//         const { data: { user } } = await supabase.auth.getUser();
//         if (user) {
//           const { data: hospital, error } = await supabase
//             .from('hospital_profiles')
//             .select('*')
//             .eq('email', user.email)
//             .single();
//           if (hospital) {
//             toast({
//               title: "Login Successful",
//               description: "Welcome to your hospital dashboard."
//             });
//             navigate('/dashboard/hospital');
//           } else {
//             toast({
//               title: "Profile Not Found",
//               description: "No hospital profile found for this account.",
//               variant: "destructive"
//             });
//           }
//         }
//       }
//     }
//   } catch (error: any) {
//     toast({
//       title: "Error",
//       description: error.message || "An unexpected error occurred",
//       variant: "destructive"
//     });
//   }

//   setLoading(false);
// };










//   // const handleSubmit = async (e: React.FormEvent) => {
//   //   e.preventDefault();
//   //   setLoading(true);

//   //   try {
//   //     if (isSignUp) {
//   //       // 1. Register with Supabase Auth
//   //       const { data, error: signUpError } = await supabase.auth.signUp({
//   //         email,
//   //         password,
//   //       });

//   //       if (signUpError) {
//   //         toast({
//   //           title: "Registration Failed",
//   //           description: signUpError.message,
//   //           variant: "destructive"
//   //         });
//   //         setLoading(false);
//   //         return;
//   //       }

//   //       // 2. Insert hospital profile (use user.id as id if you want, or let Supabase auto-generate)
//   //       const { error: insertError } = await supabase
//   //         .from('hospital_profiles')
//   //         .insert([{
//   //           email,
//   //           hospital_name: hospitalName,
//   //           address,
//   //           phone,
//   //           contact_person: contactPerson,
//   //           latitude: Number(latitude),
//   //           longitude: Number(longitude),
//   //           capacity: capacity ? Number(capacity) : 0,
//   //           // id: data.user?.id, // Uncomment if you want to use auth user id as hospital id
//   //         }]);

//   //       if (insertError) {
//   //         toast({
//   //           title: "Profile Creation Failed",
//   //           description: insertError.message,
//   //           variant: "destructive"
//   //         });
//   //       } else {
//   //         toast({
//   //           title: "Registration Successful",
//   //           description: "Please check your email to verify your account."
//   //         });
//   //         setIsSignUp(false);
//   //       }
//   //     } else {
//   //       // Login with Supabase Auth
//   //       const { error: signInError } = await supabase.auth.signInWithPassword({
//   //         email,
//   //         password,
//   //       });

//   //       if (signInError) {
//   //         toast({
//   //           title: "Login Failed",
//   //           description: signInError.message,
//   //           variant: "destructive"
//   //         });
//   //       } else {
//   //         // Fetch hospital profile and redirect
//   //         const { data: { user } } = await supabase.auth.getUser();
//   //         if (user) {
//   //           const { data: hospital, error } = await supabase
//   //             .from('hospital_profiles')
//   //             .select('*')
//   //             .eq('email', user.email)
//   //             .single();
//   //           if (hospital) {
//   //             toast({
//   //               title: "Login Successful",
//   //               description: "Welcome to your hospital dashboard."
//   //             });
//   //             navigate('/dashboard/hospital');
//   //           } else {
//   //             toast({
//   //               title: "Profile Not Found",
//   //               description: "No hospital profile found for this account.",
//   //               variant: "destructive"
//   //             });
//   //           }
//   //         }
//   //       }
//   //     }
//   //   } catch (error: any) {
//   //     toast({
//   //       title: "Error",
//   //       description: error.message || "An unexpected error occurred",
//   //       variant: "destructive"
//   //     });
//   //   }

//   //   setLoading(false);
//   // };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
//       <Card className="w-full max-w-md">
//         <CardHeader className="text-center">
//           <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
//             <Building2 className="h-6 w-6 text-white" />
//           </div>
//           <CardTitle className="text-2xl text-blue-900">
//             {isSignUp ? 'Hospital Registration' : 'Hospital Login'}
//           </CardTitle>
//           <CardDescription>
//             {isSignUp
//               ? 'Register your hospital to join our emergency response network'
//               : 'Access your hospital dashboard'
//             }
//           </CardDescription>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-4">
//             {isSignUp && (
//               <>
//                 <div className="relative">
//                   <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     placeholder="Hospital Name"
//                     value={hospitalName}
//                     onChange={(e) => setHospitalName(e.target.value)}
//                     className="pl-10"
//                     required={isSignUp}
//                   />
//                 </div>
//                 <div className="relative">
//                   <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     placeholder="Address"
//                     value={address}
//                     onChange={(e) => setAddress(e.target.value)}
//                     className="pl-10"
//                     required={isSignUp}
//                   />
//                 </div>
//                 <div className="relative">
//                   <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     placeholder="Phone"
//                     value={phone}
//                     onChange={(e) => setPhone(e.target.value)}
//                     className="pl-10"
//                     required={isSignUp}
//                   />
//                 </div>
//                 <div className="relative">
//                   <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     placeholder="Contact Person"
//                     value={contactPerson}
//                     onChange={(e) => setContactPerson(e.target.value)}
//                     className="pl-10"
//                     required={isSignUp}
//                   />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       placeholder="Latitude"
//                       type="number"
//                       value={latitude}
//                       onChange={(e) => setLatitude(e.target.value)}
//                       className="pl-10"
//                       required={isSignUp}
//                     />
//                   </div>
//                   <div className="relative">
//                     <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                     <Input
//                       placeholder="Longitude"
//                       type="number"
//                       value={longitude}
//                       onChange={(e) => setLongitude(e.target.value)}
//                       className="pl-10"
//                       required={isSignUp}
//                     />
//                   </div>
//                 </div>
//                 <div className="relative">
//                   <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//                   <Input
//                     placeholder="Capacity"
//                     type="number"
//                     value={capacity}
//                     onChange={(e) => setCapacity(e.target.value)}
//                     className="pl-10"
//                     required={isSignUp}
//                   />
//                 </div>
//               </>
//             )}

//             <div className="relative">
//               <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <Input
//                 type="email"
//                 placeholder="Email"
//                 value={email}
//                 onChange={(e) => setEmail(e.target.value)}
//                 className="pl-10"
//                 required
//               />
//             </div>

//             <div className="relative">
//               <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
//               <Input
//                 type="password"
//                 placeholder="Password"
//                 value={password}
//                 onChange={(e) => setPassword(e.target.value)}
//                 className="pl-10"
//                 required
//                 autoComplete="current-password"
//               />
//             </div>

//             <Button
//               type="submit"
//               className="w-full bg-blue-600 hover:bg-blue-700"
//               disabled={loading}
//             >
//               {loading ? 'Processing...' : (isSignUp ? 'Register Hospital' : 'Login')}
//             </Button>
//           </form>

//           <div className="mt-4 text-center">
//             <Button
//               variant="link"
//               onClick={() => setIsSignUp(!isSignUp)}
//               className="text-blue-600"
//             >
//               {isSignUp
//                 ? 'Already have an account? Login here'
//                 : 'Need to register your hospital? Sign up here'
//               }
//             </Button>
//           </div>

//           <div className="mt-4 text-center">
//             <Button
//               variant="link"
//               onClick={() => navigate('/')}
//               className="text-gray-600"
//             >
//               Back to Home
//             </Button>
//           </div>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default HospitalAuth;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Building2, Mail, Lock, Phone, MapPin, User } from 'lucide-react';

const HospitalAuth = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hospitalName, setHospitalName] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [capacity, setCapacity] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setLoading(true);

  try {
    if (isSignUp) {
      // 1. Register with Supabase Auth
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        toast({
          title: "Registration Failed",
          description: signUpError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const userId = data.user?.id;

      // 2. Insert hospital profile
      const { error: insertError } = await supabase
        .from('hospital_profiles')
        .insert([{
          email,
          hospital_name: hospitalName,
          address,
          phone,
          contact_person: contactPerson,
          latitude: Number(latitude),
          longitude: Number(longitude),
          capacity: capacity ? Number(capacity) : 0,
          id: userId,
        }]);

      // 3. Update user_type in profiles (optional — can remove if not using profiles table)
      const { error: updateRoleError } = await supabase
        .from('profiles')
        .update({ user_type: 'hospital' })
        .eq('id', userId);

      if (insertError || updateRoleError) {
        toast({
          title: "Profile Creation Failed",
          description: insertError?.message || updateRoleError?.message,
          variant: "destructive"
        });
      } else {
        toast({
          title: "Registration Successful",
          description: "Please check your email to verify your account."
        });
        setIsSignUp(false);
      }
    } else {
      // Login
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        toast({
          title: "Login Failed",
          description: signInError.message,
          variant: "destructive"
        });
        setLoading(false);
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data: hospital, error } = await supabase
          .from('hospital_profiles')
          .select('*')
          .eq('email', user.email)
          .single();

        if (hospital) {
          toast({
            title: "Login Successful",
            description: "Welcome to your hospital dashboard."
          });

          // Add a delay to avoid any UI rendering conflicts
          setTimeout(() => {
            navigate('/dashboard/hospital');
          }, 300);
        } else {
          toast({
            title: "Profile Not Found",
            description: "No hospital profile found for this account.",
            variant: "destructive"
          });
        }
      }
    }
  } catch (error: any) {
    toast({
      title: "Error",
      description: error.message || "An unexpected error occurred",
      variant: "destructive"
    });
  }

  setLoading(false);
};

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mb-4">
            <Building2 className="h-6 w-6 text-white" />
          </div>
          <CardTitle className="text-2xl text-blue-900">
            {isSignUp ? 'Hospital Registration' : 'Hospital Login'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Register your hospital to join our emergency response network'
              : 'Access your hospital dashboard'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Hospital Name"
                    value={hospitalName}
                    onChange={(e) => setHospitalName(e.target.value)}
                    className="pl-10"
                    required={isSignUp}
                  />
                </div>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Address"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="pl-10"
                    required={isSignUp}
                  />
                </div>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10"
                    required={isSignUp}
                  />
                </div>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Contact Person"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    className="pl-10"
                    required={isSignUp}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Latitude"
                      type="number"
                      value={latitude}
                      onChange={(e) => setLatitude(e.target.value)}
                      className="pl-10"
                      required={isSignUp}
                    />
                  </div>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Longitude"
                      type="number"
                      value={longitude}
                      onChange={(e) => setLongitude(e.target.value)}
                      className="pl-10"
                      required={isSignUp}
                    />
                  </div>
                </div>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Capacity"
                    type="number"
                    value={capacity}
                    onChange={(e) => setCapacity(e.target.value)}
                    className="pl-10"
                    required={isSignUp}
                  />
                </div>
              </>
            )}

            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10"
                required
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={loading}
            >
              {loading ? 'Processing...' : (isSignUp ? 'Register Hospital' : 'Login')}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-blue-600"
            >
              {isSignUp
                ? 'Already have an account? Login here'
                : 'Need to register your hospital? Sign up here'
              }
            </Button>
          </div>

          <div className="mt-4 text-center">
            <Button
              variant="link"
              onClick={() => navigate('/')}
              className="text-gray-600"
            >
              Back to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default HospitalAuth;
