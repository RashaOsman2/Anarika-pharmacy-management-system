import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    
    const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const ownerEmail = "Jesans418@gmail.com";
    const ownerPassword = "anarika206";

    // Find the owner user by email
    const { data: users, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) {
      console.error("Error listing users:", listError);
      throw listError;
    }

    const ownerUser = users.users.find(u => u.email?.toLowerCase() === ownerEmail.toLowerCase());
    
    if (ownerUser) {
      // Update existing user's password
      console.log("Owner user found, updating password");
      const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
        ownerUser.id,
        { password: ownerPassword }
      );

      if (updateError) {
        console.error("Error updating password:", updateError);
        throw updateError;
      }

      console.log("Owner password updated successfully");
      return new Response(
        JSON.stringify({ success: true, message: "Owner password has been updated" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    } else {
      // Create new owner user
      console.log("Owner user not found, creating new user");
      
      // First delete the orphan profile if it exists
      await supabaseAdmin.from('profiles').delete().eq('email', ownerEmail);
      
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: ownerEmail,
        password: ownerPassword,
        email_confirm: true,
        user_metadata: {
          role: 'owner',
          shop_name: null
        }
      });

      if (createError) {
        console.error("Error creating user:", createError);
        throw createError;
      }

      console.log("Owner user created successfully:", newUser.user?.id);
      return new Response(
        JSON.stringify({ success: true, message: "Owner account has been created", userId: newUser.user?.id }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }
  } catch (error: any) {
    console.error("Error in reset-owner-password:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
});