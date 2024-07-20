export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      featureFlags: {
        Row: {
          created_at: string
          id: number
          isEnabled: boolean | null
          name: Database["public"]["Enums"]["featureFlag"]
        }
        Insert: {
          created_at?: string
          id?: number
          isEnabled?: boolean | null
          name: Database["public"]["Enums"]["featureFlag"]
        }
        Update: {
          created_at?: string
          id?: number
          isEnabled?: boolean | null
          name?: Database["public"]["Enums"]["featureFlag"]
        }
        Relationships: []
      }
      messages: {
        Row: {
          createdAt: string
          id: number
          isSystem: boolean
          mediaType: Database["public"]["Enums"]["mediaType"] | null
          mediaUrl: string | null
          receiverId: string | null
          receiverName: string | null
          senderId: string
          senderName: string | null
          teamId: string
          text: string | null
        }
        Insert: {
          createdAt?: string
          id?: number
          isSystem?: boolean
          mediaType?: Database["public"]["Enums"]["mediaType"] | null
          mediaUrl?: string | null
          receiverId?: string | null
          receiverName?: string | null
          senderId: string
          senderName?: string | null
          teamId: string
          text?: string | null
        }
        Update: {
          createdAt?: string
          id?: number
          isSystem?: boolean
          mediaType?: Database["public"]["Enums"]["mediaType"] | null
          mediaUrl?: string | null
          receiverId?: string | null
          receiverName?: string | null
          senderId?: string
          senderName?: string | null
          teamId?: string
          text?: string | null
        }
        Relationships: []
      }
      pushTokens: {
        Row: {
          createdAt: string
          expoPushToken: string
          teamId: string
          userId: string
        }
        Insert: {
          createdAt?: string
          expoPushToken: string
          teamId: string
          userId: string
        }
        Update: {
          createdAt?: string
          expoPushToken?: string
          teamId?: string
          userId?: string
        }
        Relationships: []
      }
    }
    Views: {
      latestMessageInConversation: {
        Row: {
          conversationId: string | null
          createdAt: string | null
          id: number | null
          isSystem: boolean | null
          receiverId: string | null
          receiverName: string | null
          senderId: string | null
          senderName: string | null
          teamId: string | null
          text: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      featureFlag: "chat"
      mediaType: "image" | "audio"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
