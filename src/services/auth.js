import { supabase, setCurrentCedula, getCurrentCedula } from "../config/supabase";

// login por cedula
export const loginWithCedula = async (cedula) => {
    try {
        // buscar estudiante por cedula
        const { data: student, error } = await supabase
            .from('students'
            .select(
        name,
        cedula,
        parent_name,
        parent_phone,
        parent_email,
        created_at        id,
        
            )
            )
    } catch (error) {
        
    }
}