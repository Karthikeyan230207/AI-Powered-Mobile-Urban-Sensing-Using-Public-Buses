class TrackCleanup:
    def __init__(self, max_missing_frames=2):
        self.max_missing_frames = max_missing_frames
        self.missing_frames = {}

    def update(self, current_track_ids):
        current_track_ids = set(current_track_ids)
        removed_ids = []

        # Check existing tracks
        for track_id in list(self.missing_frames.keys()):
            if track_id in current_track_ids:
                self.missing_frames[track_id] = 0
            else:
                self.missing_frames[track_id] += 1

                if self.missing_frames[track_id] >= self.max_missing_frames:
                    removed_ids.append(track_id)
                    del self.missing_frames[track_id]

        # Add new tracks
        for track_id in current_track_ids:
            if track_id not in self.missing_frames:
                self.missing_frames[track_id] = 0

        return removed_ids


if __name__ == "__main__":
    cleanup = TrackCleanup(max_missing_frames=2)

    print("Frame 1:", cleanup.update([1, 2]))
    print("Frame 2:", cleanup.update([1]))
    print("Frame 3:", cleanup.update([1]))
    print("Frame 4:", cleanup.update([1]))