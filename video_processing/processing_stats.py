import time


class ProcessingStats:
    def __init__(self):
        self.start_time = None
        self.processed_frames = 0

    def start(self):
        self.start_time = time.time()

    def add_frame(self):
        self.processed_frames += 1

    def get_fps(self):
        if self.start_time is None:
            return 0

        elapsed_time = time.time() - self.start_time

        if elapsed_time <= 0:
            return 0

        return self.processed_frames / elapsed_time


if __name__ == "__main__":
    stats = ProcessingStats()

    stats.start()

    for _ in range(10):
        time.sleep(0.1)
        stats.add_frame()

    print("Processed frames:", stats.processed_frames)
    print("Processing FPS:", round(stats.get_fps(), 2))