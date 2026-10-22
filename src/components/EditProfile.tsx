import { useCallback, useEffect, useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import Cropper from "react-easy-crop";
import axios from "axios";
import { useDispatch } from "react-redux";
import UserCard from "./UserCard";
import { BASE_URL } from "../utils/constants";
import { addUser } from "../utils/userSlice";

type EditProfileProps = {
  user?: any;
};

type PixelCrop = {
  x: number;
  y: number;
  width: number;
  height: number;
};

const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("Could not load the selected image."));
    image.src = url;
  });

const getCroppedImg = async (
  imageSrc: string,
  pixelCrop: PixelCrop
): Promise<Blob> => {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  if (!context) throw new Error("Could not process the image.");

  const outputSize = 400;
  canvas.width = outputSize;
  canvas.height = outputSize;

  context.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    outputSize,
    outputSize
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob);
        else reject(new Error("Failed to crop image."));
      },
      "image/jpeg",
      0.9
    );
  });
};

const EditProfile = ({ user }: EditProfileProps) => {
  const [firstName, setFirstName] = useState(user?.firstName ?? "");
  const [lastName, setLastName] = useState(user?.lastName ?? "");
  const [photoUrl, setPhotoUrl] = useState(
    user?.photoUrl ?? user?.profilePhoto?.url ?? ""
  );
  const [age, setAge] = useState(user?.age ?? "");
  const [gender, setGender] = useState(user?.gender ?? "");
  const [about, setAbout] = useState(user?.about ?? "");

  const [error, setError] = useState("");
  const [showToast, setShowToast] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dispatch = useDispatch();

  useEffect(() => {
    return () => {
      if (selectedImage) URL.revokeObjectURL(selectedImage);
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [selectedImage]);

  const onCropComplete = useCallback((_area: Area, croppedPixels: Area) => {
    setCroppedAreaPixels({
      x: croppedPixels.x,
      y: croppedPixels.y,
      width: croppedPixels.width,
      height: croppedPixels.height,
    });
  }, []);

  // Validate the selected file and open the crop modal. Upload happens after cropping.
  const handlePhotoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;

    setError("");

    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Please select a JPG, PNG, or WebP image.");
      input.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5 MB.");
      input.value = "";
      return;
    }

    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(URL.createObjectURL(file));
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCroppedAreaPixels(null);
    input.value = ""; // Allows choosing the same file again later.
  };

  const cancelCrop = () => {
    if (selectedImage) URL.revokeObjectURL(selectedImage);
    setSelectedImage(null);
    setCroppedAreaPixels(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  };

  const handleCropAndUpload = async () => {
    if (!selectedImage || !croppedAreaPixels || uploading) return;

    setError("");
    try {
      setUploading(true);
      const croppedBlob = await getCroppedImg(selectedImage, croppedAreaPixels);
      const formData = new FormData();
      formData.append("profilePhoto", croppedBlob, "profile-photo.jpg");

      const response = await axios.post(
        `${BASE_URL}/profile/photo`,
        formData,
        { withCredentials: true }
      );

      // Preserve the response shape used by the existing backend.
      const uploadedPhotoUrl =
        response.data?.profilePhoto?.url ??
        response.data?.data?.photoUrl ??
        response.data?.data?.profilePhoto?.url;

      if (!uploadedPhotoUrl) {
        throw new Error("Upload response did not include the profile photo URL.");
      }

      setPhotoUrl(uploadedPhotoUrl);
      if (response.data?.data) dispatch(addUser(response.data.data));

      URL.revokeObjectURL(selectedImage);
      setSelectedImage(null);
      setCroppedAreaPixels(null);
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message || "Failed to upload profile photo.");
      } else if (err instanceof Error) {
        setError(err.message || "Something went wrong while uploading.");
      } else {
        setError("Something went wrong while uploading.");
      }
    } finally {
      setUploading(false);
    }
  };

  const saveProfile = async () => {
    //Clear Errors
    setError("");
    try {
      const res = await axios.patch(
        BASE_URL + "/profile/edit",
        {
          firstName,
          lastName,
          photoUrl,
          age,
          gender,
          about,
        },
        { withCredentials: true }
      );
      dispatch(addUser(res?.data?.data));
      setShowToast(true);
      setTimeout(() => {
        setShowToast(false);
      }, 3000);
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || "Something went wrong"
        );
      } else {
        setError("Something went wrong");
      }
    }
  };

  const displayedPhoto =
    photoUrl || user?.photoUrl || user?.profilePhoto?.url ||
    "https://placehold.co/200x200?text=Profile";

  return (
    <>

      <div className="mx-auto my-8 max-w-6xl px-4 sm:my-12 sm:px-6">
        <div className="grid grid-cols-1 items-start gap-8 md:grid-cols-2">

          {/* Edit Profile Card */}
          <div className="card w-full overflow-hidden border border-primary/20 bg-base-100 shadow-2xl transition-all duration-300 hover:shadow-primary/10">

            {/* Gradient Accent */}
            <div className="h-1.5 bg-gradient-to-r from-primary via-secondary to-primary" />

            <div className="card-body gap-5 p-5 sm:p-8">

              {/* Header */}
              <div className="flex items-center justify-center gap-3 text-center">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-2xl">
                  👨‍💻
                </div>

                <div>
                  <h2 className="text-xl font-extrabold sm:text-2xl">
                    Edit Profile
                  </h2>
                  <p className="text-xs text-base-content/60">
                    Update your details
                  </p>
                </div>
              </div>

              <div className="divider my-0" />

              {/* Profile Photo */}
              <div className="flex flex-col items-center gap-4 rounded-2xl border border-base-content/10 bg-base-200/50 p-5">
                <div className="avatar">
                  <div className="w-28 rounded-full ring-4 ring-primary ring-offset-4 ring-offset-base-100 shadow-xl sm:w-32">
                    <img
                      src={displayedPhoto}
                      alt="Profile"
                      className="object-cover"
                    />
                  </div>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoUpload}
                  disabled={uploading}
                />

                <button
                  type="button"
                  className="btn btn-primary btn-sm shadow-md sm:btn-md"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <span>📷</span>
                      Change Profile Photo
                    </>
                  )}
                </button>

                <p className="text-center text-xs text-base-content/50">
                  JPG, PNG or WebP · Maximum 5 MB
                </p>
              </div>

              {/* First Name */}
              <label className="form-control w-full gap-1">
                <span className="label-text font-semibold">First Name</span>
                <input
                  className="input input-bordered w-full transition focus:border-primary"
                  type="text"
                  placeholder="Enter first name"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </label>

              {/* Last Name */}
              <label className="form-control w-full gap-1">
                <span className="label-text font-semibold">Last Name</span>
                <input
                  className="input input-bordered w-full transition focus:border-primary"
                  type="text"
                  placeholder="Enter last name"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </label>

              {/* Age and Gender */}
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="form-control w-full gap-1">
                  <span className="label-text font-semibold">Age</span>
                  <input
                    className="input input-bordered w-full transition focus:border-primary"
                    type="number"
                    placeholder="Your age"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                  />
                </label>

                <label className="form-control w-full gap-1">
                  <span className="label-text font-semibold">Gender</span>
                  <input
                    className="input input-bordered w-full transition focus:border-primary"
                    type="text"
                    placeholder="Enter gender"
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                  />
                </label>
              </div>

              {/* About */}
              <label className="form-control w-full gap-1">
                <span className="label-text font-semibold">About Me</span>
                <textarea
                  className="textarea textarea-bordered min-h-28 w-full transition focus:border-primary"
                  placeholder="Tell us about yourself, your skills and interests..."
                  value={about}
                  onChange={(e) => setAbout(e.target.value)}
                />
                <span className="text-right text-xs text-base-content/40">
                  Share your developer journey 🚀
                </span>
              </label>

              {/* Error */}
              {error && (
                <div role="alert" className="alert alert-error text-sm">
                  <span>{error}</span>
                </div>
              )}

              {/* Save Button */}
              <div className="card-actions mt-2">
                <button
                  type="button"
                  className="btn btn-primary w-full shadow-lg transition duration-300 hover:scale-[1.01] hover:shadow-primary/30"
                  onClick={saveProfile}
                  disabled={uploading}
                >
                  <span>💾</span>
                  Save Profile
                </button>
              </div>

            </div>
          </div>

          {/* Live Profile Preview */}
          <div className="flex w-full flex-col items-center gap-4 md:sticky md:top-24">
            <div className="text-center">
              <h2 className="text-xl font-bold sm:text-2xl">
                Profile Preview
              </h2>
              <p className="mt-1 text-sm text-base-content/60">
                This is how others see your profile.
              </p>
            </div>

            <div className="w-full max-w-sm rounded-2xl border border-primary/20 bg-base-100 p-3 shadow-xl">
              <UserCard
                user={{
                  ...user,
                  firstName,
                  lastName,
                  photoUrl,
                  age,
                  gender,
                  about,
                }}
                isHideActionBtn={true}
              />
            </div>

            <p className="text-center text-xs text-base-content/50">
              Changes appear here as you edit your details.
            </p>
          </div>

        </div>
      </div>

      {showToast && (
        <div className="toast toast-top toast-center z-[99999]">
          <div className="alert alert-success"><span>Profile updated successfully!</span></div>
        </div>
      )}

      {selectedImage && (
        <div className="modal modal-open z-50" role="dialog" aria-modal="true" aria-labelledby="crop-modal-title">
          <div className="modal-box max-w-lg">
            <h3 id="crop-modal-title" className="mb-4 text-lg font-bold">Crop Your Profile Photo</h3>

            <div className="relative h-72 w-full overflow-hidden rounded-lg bg-base-300">
              <Cropper
                image={selectedImage}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onCropComplete={onCropComplete}
              />
            </div>

            <div className="form-control mt-5">
              <label className="label" htmlFor="photo-zoom"><span className="label-text">Zoom</span></label>
              <input id="photo-zoom" type="range" min={1} max={3} step={0.1} value={zoom} onChange={(e) => setZoom(Number(e.target.value))} className="range range-primary" />
            </div>

            <div className="modal-action">
              <button type="button" className="btn btn-ghost" onClick={cancelCrop} disabled={uploading}>Cancel</button>
              <button type="button" className="btn btn-primary" onClick={handleCropAndUpload} disabled={uploading || !croppedAreaPixels}>
                {uploading ? <><span className="loading loading-spinner loading-sm" /> Uploading...</> : "Crop & Upload"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default EditProfile;
