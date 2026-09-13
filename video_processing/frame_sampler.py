def sample_frames(frames, interval=5):
    if interval <= 0:
        raise ValueError("Sampling interval must be greater than 0.")

    sampled_frames = []

    for i in range(0, len(frames), interval):
        sampled_frames.append(frames[i])

    return sampled_frames


if __name__ == "__main__":
    frames = list(range(30))

    sampled = sample_frames(frames, interval=5)

    print("Original frame count:", len(frames))
    print("Sampled frame count:", len(sampled))
    print("Sampled frames:", sampled)