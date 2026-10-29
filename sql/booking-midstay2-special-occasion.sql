-- Two mid-stay cleans support
ALTER TABLE "mgl-365".bookings ADD COLUMN IF NOT EXISTS midstay_clean_date_2 date;

-- Special occasion field on bookings
ALTER TABLE "mgl-365".bookings ADD COLUMN IF NOT EXISTS special_occasion text;
