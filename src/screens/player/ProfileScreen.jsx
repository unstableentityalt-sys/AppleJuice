import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useStorage } from "../../lib/useStorage";
import TopBar from "../../components/TopBar";
import AccountButton from "../../components/AccountButton";

const POSITIONS = ["Pitcher", "Catcher", "1B", "2B", "3B", "SS", "LF", "CF", "RF", "Utility"];

const BLANK_PROFILE = { bio: "", photo: "", position: "Utility", jerseyNumber: "" };

export default function ProfileScreen() {
  const { account } = useAuth();
  const [profile, setProfile] = useStorage(`profile:${account.id}`, BLANK_PROFILE, {
    shared: false,
  });
  const [saved, setSaved] = useState(false);

  function handlePhoto(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((p) => ({ ...p, photo: reader.result }));
    reader.readAsDataURL(file);
  }

  function handleSave(e) {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 1500);
  }

  return (
    <>
      <TopBar title="My Profile" right={<AccountButton />} />
      <div className="app-main">
        <form className="card" onSubmit={handleSave}>
          <div className="row" style={{ justifyContent: "center", marginBottom: 14 }}>
            <div className="avatar" style={{ width: 84, height: 84, fontSize: 28 }}>
              {profile.photo ? (
                <img src={profile.photo} alt="" />
              ) : (
                account.username.slice(0, 2).toUpperCase()
              )}
            </div>
          </div>
          <div className="field">
            <label htmlFor="profile-photo">Photo</label>
            <input id="profile-photo" type="file" accept="image/*" onChange={handlePhoto} />
          </div>
          <div className="field">
            <label>Username</label>
            <input value={account.username} disabled />
          </div>
          <div className="row">
            <div className="field" style={{ flex: 1 }}>
              <label htmlFor="profile-jersey">Jersey #</label>
              <input
                id="profile-jersey"
                value={profile.jerseyNumber}
                onChange={(e) => setProfile((p) => ({ ...p, jerseyNumber: e.target.value }))}
              />
            </div>
            <div className="field" style={{ flex: 2 }}>
              <label htmlFor="profile-position">Position</label>
              <select
                id="profile-position"
                value={profile.position}
                onChange={(e) => setProfile((p) => ({ ...p, position: e.target.value }))}
              >
                {POSITIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="field">
            <label htmlFor="profile-bio">Bio</label>
            <textarea
              id="profile-bio"
              rows={4}
              value={profile.bio}
              onChange={(e) => setProfile((p) => ({ ...p, bio: e.target.value }))}
              placeholder="Bats lefty, throws whatever's handy..."
            />
          </div>
          <button className="btn block" type="submit">
            {saved ? "Saved ✓" : "Save Profile"}
          </button>
          <p style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8, textAlign: "center" }}>
            Profile info only — your stats are calculated automatically and can't be edited
            here.
          </p>
        </form>
      </div>
    </>
  );
}
