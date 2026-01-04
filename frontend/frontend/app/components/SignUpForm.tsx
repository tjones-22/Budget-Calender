import bcrypt from 'bcryptjs';


const hashPassword = async (password:string) => {
return  await bcrypt.hash(password, 12);
}
const SignUp = () => {
  let error = false;
  let errMessage = "";

  const createuserData = async (formData: FormData) => {
    "use server";

    const nameValue = formData.get("name");
    const usernameValue = formData.get("username");
    const passwordValue = formData.get("password");
    const phoneValue = formData.get("phone");

    const name = typeof nameValue === "string" ? nameValue : "";
    const username = typeof usernameValue === "string" ? usernameValue : "";
    const password = typeof passwordValue === "string" ? passwordValue : "";
    const phone = typeof phoneValue === "string" ? phoneValue : "";

    if (!name || !username || !password || !phone) {
      error = true;
      errMessage = "Please fill out all fields";
    }

     if(password.length < 8){
        error = true;
        errMessage = "Password must be longer than 8 characters";
        
    }

    const hashedPassword = hashPassword(password);
    return {name,username,password,phone}
    
  };

  const sendData = async (formData:FormData) => {
    "use server";
    const data = await createuserData(formData);
    if(!data){
        return;
    }
    const response = await fetch("XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if(!response.ok){
        error = true;
        errMessage = "Error: " + response.statusText;
        return;
    }

    
  }

  return (
    <>
      <form className="mx-auto mt-16 w-full max-w-6xl justify-around rounded-3xl border-2 border-slate-900/70 bg-white/70 px-4 py-8 shadow-[0_18px_45px_-25px_rgba(15,23,42,0.8)] sm:mt-20 sm:px-6 sm:py-10 md:mt-24">
        <h2 className="text-center text-3xl underline">Sign Up</h2>

        <div className="flex flex-row  items-center ">
          <div className="flex w-1/2 flex-col items-start gap-5">
            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label className="text-left text-lg font-medium" htmlFor="name">
                Name
              </label>
              <input
                className="border-2 border-black rounded-tl-2xl text-black ml-1 p-1.5 focus-visible:outline-slate-900 w-[20vw]"
                type="text"
                name="name"
                id="name"
                placeholder="Name"
                required
              />
            </div>

            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label
                className="text-left text-lg font-medium"
                htmlFor="username"
              >
                Username
              </label>
              <input
                className="border-2 border-black rounded-tl-2xl text-black ml-1 p-1.5 focus-visible:outline-slate-900 w-[20vw]"
                type="text"
                name="username"
                id="username"
                placeholder="Username"
                required
              />
            </div>

            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label
                className="text-left text-lg font-medium"
                htmlFor="password"
              >
                Password
              </label>
              <input
                className="border-2 border-black rounded-tl-2xl text-black ml-1 p-1.5 focus-visible:outline-slate-900 w-[20vw]"
                type="password"
                name="password"
                id="password"
                placeholder="Password"
                required
              />
            </div>
            <div className="flex w-full max-w-md flex-col items-start gap-2">
              <label className="text-left text-lg font-medium" htmlFor="phone">
                Phone
              </label>
              <input
                className="border-2 border-black rounded-tl-2xl text-black ml-1 p-1.5 focus-visible:outline-slate-900 w-[20vw]"
                type="phone"
                name="phone"
                id="phone"
                placeholder="(012)-345-6789"
                required
              />
            </div>
          </div>

          {error && <h3 className="text-red-300"> {errMessage}</h3>}
        </div>

        <button
          className="border-2 rounded-full  bg-slate-900 px-6 py-2.5 text-white shadow-md transition hover:-translate-y-0.5 hover:bg-slate-800 hover:border-yellow-500  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900 focus-visible:ring-offset-2 mt-2"
          type="submit"
          formAction={sendData}
        >
          {" "}
          Sign Up
        </button>
      </form>
    </>
  );
};

export default SignUp;
