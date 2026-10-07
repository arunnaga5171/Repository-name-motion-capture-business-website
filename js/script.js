// MotionForge frontend interactions + Three.js hero scene
const APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyDSzuJfn5j-8bRwCQmQhpTNSzhcEALYD3Snkq4nrdB13LXAVmi6l_r1592RTeOfX1D_g/exec";

window.addEventListener("load", () => {
  document.getElementById("preloader")?.classList.add("done");
});
document.getElementById("year").textContent = new Date().getFullYear();

const menuToggle = document.getElementById("menuToggle");
const nav = document.getElementById("nav");
menuToggle?.addEventListener("click", () => {
  const opened = nav.classList.toggle("open");
  menuToggle.setAttribute("aria-expanded", String(opened));
});
nav?.querySelectorAll("a").forEach(link => link.addEventListener("click", () => {
  nav.classList.remove("open");
  menuToggle?.setAttribute("aria-expanded", "false");
}));

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });
document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

// Interactive 3D motion-capture inspired point cloud / skeleton scene.
function initThreeScene() {
  const host = document.getElementById("threeScene");
  if (!host || !window.THREE) {
    if (host) host.innerHTML = '<div class="scene-fallback">3D preview requires an internet connection to load Three.js.</div>';
    return;
  }
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, host.clientWidth / host.clientHeight, 0.1, 100);
  camera.position.set(0, 0.3, 8.5);
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(host.clientWidth, host.clientHeight);
  renderer.setClearColor(0x000000, 0);
  host.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0x9bdedc, 1.6));
  const key = new THREE.PointLight(0x67f4e2, 22, 30);
  key.position.set(3, 4, 5); scene.add(key);
  const violet = new THREE.PointLight(0x9d8cff, 14, 25);
  violet.position.set(-4, -2, 2); scene.add(violet);

  const group = new THREE.Group(); scene.add(group);
  const material = new THREE.MeshStandardMaterial({ color: 0x67f4e2, emissive: 0x124c50, metalness: .45, roughness: .28 });
  const jointMat = new THREE.MeshStandardMaterial({ color: 0xd7fff8, emissive: 0x367f7c, metalness: .3, roughness: .25 });
  const jointGeo = new THREE.SphereGeometry(.075, 12, 12);
  const bones = [];
  const joints = [];
  const points = {
    head:[0,1.65,0], neck:[0,1.28,0], chest:[0,.85,0], waist:[0,.25,0], hip:[0,-.15,0],
    lShoulder:[-.48,1.12,0], lElbow:[-.78,.68,.05], lHand:[-.94,.22,.1],
    rShoulder:[.48,1.12,0], rElbow:[.72,.72,-.05], rHand:[.88,.35,.05],
    lHip:[-.24,-.18,0], lKnee:[-.38,-.78,.04], lFoot:[-.48,-1.38,.22],
    rHip:[.24,-.18,0], rKnee:[.36,-.8,-.04], rFoot:[.5,-1.36,.2]
  };
  const links = [["head","neck"],["neck","chest"],["chest","waist"],["waist","hip"],
    ["chest","lShoulder"],["lShoulder","lElbow"],["lElbow","lHand"],
    ["chest","rShoulder"],["rShoulder","rElbow"],["rElbow","rHand"],
    ["hip","lHip"],["lHip","lKnee"],["lKnee","lFoot"],
    ["hip","rHip"],["rHip","rKnee"],["rKnee","rFoot"]];
  const boneGeo = new THREE.CylinderGeometry(.025, .025, 1, 8);
  function addBone(a, b) {
    const mesh = new THREE.Mesh(boneGeo, material);
    group.add(mesh); bones.push({mesh, a, b});
  }
  Object.keys(points).forEach(name => {
    const joint = new THREE.Mesh(jointGeo, name === "head" ? material : jointMat);
    group.add(joint); joints.push({mesh:joint,name});
  });
  links.forEach(([a,b]) => addBone(a,b));

  // A subtle rotating data field around the captured performer.
  const ringMat = new THREE.MeshBasicMaterial({ color: 0x67f4e2, transparent: true, opacity: .22, wireframe: true });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75, .012, 4, 100), ringMat);
  ring.rotation.x = Math.PI / 2.4; ring.position.y = -.15; group.add(ring);
  const ring2 = new THREE.Mesh(new THREE.TorusGeometry(2.05, .008, 4, 100), new THREE.MeshBasicMaterial({color:0x9d8cff,transparent:true,opacity:.3}));
  ring2.rotation.x = Math.PI / 2.1; ring2.rotation.y = .5; group.add(ring2);

  // Dotted motion-capture grid.
  const dotPositions = [];
  for (let x=-4; x<=4; x+=.35) for(let z=-2;z<=2;z+=.35) dotPositions.push(x,-1.65,z);
  const dotsGeo = new THREE.BufferGeometry();
  dotsGeo.setAttribute("position", new THREE.Float32BufferAttribute(dotPositions,3));
  const dots = new THREE.Points(dotsGeo,new THREE.PointsMaterial({color:0x4f9c9c,size:.018,transparent:true,opacity:.55}));
  group.add(dots);

  let pointerX = 0, pointerY = 0;
  host.addEventListener("pointermove", e => {
    const r = host.getBoundingClientRect();
    pointerX = ((e.clientX-r.left)/r.width-.5)*.45;
    pointerY = ((e.clientY-r.top)/r.height-.5)*.25;
  });
  host.addEventListener("pointerleave", () => {pointerX=0;pointerY=0;});
  const vA = new THREE.Vector3(), vB = new THREE.Vector3(), direction = new THREE.Vector3();
  const clock = new THREE.Clock();
  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();
    // Pose shifts slightly to create a continuous captured-motion feeling.
    const pose = {};
    Object.entries(points).forEach(([name, p]) => {
      pose[name] = [...p];
      if (name.includes("Hand")) pose[name][1] += Math.sin(t*1.7 + (name.startsWith("l")?0:1))*0.09;
      if (name.includes("Elbow")) pose[name][2] += Math.sin(t*1.2)*0.06;
      if (name.includes("Knee")) pose[name][1] += Math.sin(t*1.5 + (name.startsWith("l")?0:2))*0.06;
      if (name === "head") pose[name][1] += Math.sin(t*1.3)*0.025;
    });
    joints.forEach(({mesh,name}) => mesh.position.set(...pose[name]));
    bones.forEach(({mesh,a,b}) => {
      vA.set(...pose[a]); vB.set(...pose[b]); direction.subVectors(vB,vA);
      mesh.position.copy(vA).add(vB).multiplyScalar(.5);
      mesh.scale.set(1,direction.length(),1);
      mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),direction.normalize());
    });
    group.rotation.y += (pointerX-group.rotation.y)*.035;
    group.rotation.x += (pointerY-group.rotation.x)*.035;
    ring.rotation.z = t*.12;
    ring2.rotation.z = -t*.09;
    renderer.render(scene,camera);
  }
  const resize = () => {
    if (!host.clientWidth || !host.clientHeight) return;
    camera.aspect = host.clientWidth/host.clientHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(host.clientWidth,host.clientHeight);
  };
  window.addEventListener("resize",resize);
  animate();
}
initThreeScene();

// Contact form sends JSON to Apps Script using no-cors. This avoids browser CORS blocking,
// but the browser cannot read Google's response; show a clear submitted status after send.
const form = document.getElementById("contactForm");
const statusEl = document.getElementById("formStatus");
form?.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.textContent = "";
  statusEl.classList.remove("error");
  if (!form.reportValidity()) return;
  if (!APPS_SCRIPT_URL || APPS_SCRIPT_URL.includes("PASTE_YOUR")) {
    statusEl.textContent = "Setup needed: add your deployed Google Apps Script /exec URL in js/script.js.";
    statusEl.classList.add("error");
    return;
  }
  const button = form.querySelector('button[type="submit"]');
  const label = button.querySelector(".button-label");
  const oldLabel = label.textContent;
  button.disabled = true;
  label.textContent = "Sending enquiry...";
  const payload = {
    name: form.name.value.trim(),
    email: form.email.value.trim(),
    phone: form.phone.value.trim(),
    service: form.service.value,
    message: form.message.value.trim(),
    page: window.location.href
  };
  try {
    await fetch(APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });
    statusEl.textContent = "Your enquiry has been sent. Thank you — we'll be in touch soon.";
    form.reset();
  } catch (error) {
    console.error("Contact form error:", error);
    statusEl.textContent = "Could not send right now. Please email hello@motionforge.studio instead.";
    statusEl.classList.add("error");
  } finally {
    button.disabled = false;
    label.textContent = oldLabel;
  }
});
