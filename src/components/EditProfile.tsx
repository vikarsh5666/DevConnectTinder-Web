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

  const showSuccessToast = useCallback(() => {
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    setShowToast(true);
    toastTimerRef.current = setTimeout(() => setShowToast(false), 3000);
  }, []);

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
    setShowToast(false);

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
    setShowToast(false);

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
      showSuccessToast();
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
    
      <div className="my-10 md:flex md:items-start md:justify-center md:gap-8">
        <div className="mx-4 mb-8 flex justify-center md:mb-0">
          <div className="card w-96 bg-base-300 shadow-xl">
            <div className="card-body">
              <h2 className="card-title justify-center">Edit Profile</h2>

              <div className="flex flex-col items-center gap-3">
                <div className="avatar">
                  <div className="w-32 rounded-full ring ring-primary ring-offset-2 ring-offset-base-100">
                    <img src={displayedPhoto} alt="Profile" className="object-cover" />
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
                  className="btn btn-outline btn-primary btn-sm"
                  disabled={uploading}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <>
                      <span className="loading loading-spinner loading-xs" />
                      Uploading...
                    </>
                  ) : (
                    "📷 Upload Photo"
                  )}
                </button>

                <p className="text-xs opacity-70">JPG, PNG, WebP · Maximum 5 MB</p>
              </div>

              <label className="form-control my-2 w-full">
                <div className="label"><span className="label-text">First Name:</span></div>
                <input className="input input-bordered w-full" type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </label>

              <label className="form-control my-2 w-full">
                <div className="label"><span className="label-text">Last Name:</span></div>
                <input className="input input-bordered w-full" type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </label>

              <label className="form-control my-2 w-full">
                <div className="label"><span className="label-text">Age:</span></div>
                <input className="input input-bordered w-full" type="number" value={age} onChange={(e) => setAge(e.target.value)} />
              </label>

              <label className="form-control my-2 w-full">
                <div className="label"><span className="label-text">Gender:</span></div>
                <input className="input input-bordered w-full" type="text" value={gender} onChange={(e) => setGender(e.target.value)} />
              </label>

              <label className="form-control my-2 w-full">
                <div className="label"><span className="label-text">About:</span></div>
                <textarea className="textarea textarea-bordered h-24" placeholder="Tell us about yourself..." value={about} onChange={(e) => setAbout(e.target.value)} />
              </label>

              {error && <p role="alert" className="text-sm text-error">{error}</p>}

              <div className="card-actions mt-4 justify-center">
                <button type="button" className="btn btn-primary w-full" onClick={saveProfile} disabled={uploading}>
                  Save Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center">
          <UserCard
            user={{ ...user, firstName, lastName, photoUrl, age, gender, about }}
            isHideActionBtn={true}
          />
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
