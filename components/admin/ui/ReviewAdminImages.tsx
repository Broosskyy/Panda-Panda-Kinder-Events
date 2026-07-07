import Image from "next/image";
import { ImageIcon, User } from "lucide-react";

interface ReviewAdminImagesProps {
  profileUrl: string | null;
  eventUrl: string | null;
  name: string;
  onOpen: (type: "profile" | "event") => void;
}

export function ReviewAdminImages({ profileUrl, eventUrl, name, onOpen }: ReviewAdminImagesProps) {
  return (
    <div className="review-admin-media">
      <div className="review-admin-media-slot">
        {profileUrl ? (
          <button
            type="button"
            className="review-admin-avatar-btn"
            onClick={() => onOpen("profile")}
            aria-label={`Profilbild von ${name} vergrößern`}
          >
            <Image
              src={profileUrl}
              alt=""
              fill
              className="object-cover"
              sizes="64px"
              loading="lazy"
              unoptimized={profileUrl.includes("supabase.co")}
            />
          </button>
        ) : (
          <div className="review-admin-avatar-placeholder" aria-hidden>
            <User className="h-6 w-6 text-text-muted" />
          </div>
        )}
        <span className="review-admin-media-label">Profil</span>
      </div>

      <div className="review-admin-media-slot review-admin-media-slot-event">
        {eventUrl ? (
          <button
            type="button"
            className="review-admin-event-btn"
            onClick={() => onOpen("event")}
            aria-label={`Eventfoto von ${name} vergrößern`}
          >
            <Image
              src={eventUrl}
              alt=""
              fill
              className="object-cover"
              sizes="120px"
              loading="lazy"
              unoptimized={eventUrl.includes("supabase.co")}
            />
          </button>
        ) : (
          <div className="review-admin-event-placeholder" aria-hidden>
            <ImageIcon className="h-6 w-6 text-text-muted" />
          </div>
        )}
        <span className="review-admin-media-label">Event</span>
      </div>
    </div>
  );
}
