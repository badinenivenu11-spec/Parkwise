(() => {
  const API_BASE = window.PARKING_API_BASE ??
    (["5500", "8080"].includes(window.location.port)
      ? "http://127.0.0.1:8000"
      : "");
  const baysById = new Map();
  const activityItems = [];
  let selectedFloor = "all";
  let reservationRequestInFlight = false;

  const elements = {
    floorSections: document.querySelector("#floor-sections"),
    totalCapacity: document.querySelector("#total-capacity"),
    occupiedCount: document.querySelector("#occupied-count"),
    occupiedFoot: document.querySelector("#occupied-foot"),
    availableCount: document.querySelector("#available-count"),
    occupancyRate: document.querySelector("#occupancy-rate"),
    occupancyProgress: document.querySelector("#occupancy-progress"),
    hourlyRate: document.querySelector("#hourly-rate"),
    minimumCharge: document.querySelector("#minimum-charge"),
    reservationBay: document.querySelector("#reservation-bay"),
    reservationForm: document.querySelector("#reservation-form"),
    reservationList: document.querySelector("#reservation-list"),
    reservationCount: document.querySelector("#reservation-count"),
    activityList: document.querySelector("#activity-list"),
    connectionStatus: document.querySelector("#connection-status"),
    pageError: document.querySelector("#page-error"),
  };

  function showError(message) {
    elements.pageError.textContent = message;
    elements.pageError.hidden = false;
  }

  function clearError() {
    elements.pageError.textContent = "";
    elements.pageError.hidden = true;
  }

  async function api(path, options = {}) {
    const response = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers: {
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers,
      },
    });
    if (!response.ok) {
      let message = `Request failed (${response.status})`;
      try {
        const body = await response.json();
        if (typeof body.detail === "string") {
          message = body.detail;
        } else if (Array.isArray(body.detail)) {
          message = body.detail
            .map((issue) => typeof issue?.msg === "string" ? issue.msg : JSON.stringify(issue))
            .join("; ");
        } else if (body.detail !== undefined) {
          message = JSON.stringify(body.detail);
        }
      } catch (error) {
        if (!(error instanceof SyntaxError)) throw error;
      }
      throw new Error(message);
    }
    return response.status === 204 ? null : response.json();
  }

  function renderAnalytics(data) {
    elements.totalCapacity.textContent = data.total_capacity;
    elements.occupiedCount.textContent = data.occupied;
    elements.occupiedFoot.textContent = `${data.occupied} vehicle${data.occupied === 1 ? "" : "s"} parked`;
    elements.availableCount.textContent = data.available;
    elements.occupancyRate.textContent = data.occupancy_rate;
    elements.occupancyProgress.style.width = `${Math.min(100, data.occupancy_rate)}%`;
    elements.hourlyRate.textContent = `₹${data.rate_per_hour_inr}`;
    elements.minimumCharge.textContent = `₹${data.minimum_charge_inr}`;
  }

  function renderBays() {
    const bays = [...baysById.values()].sort((left, right) =>
      left.floor - right.floor || left.number - right.number
    );
    const floors = [...new Set(bays.map((bay) => bay.floor))];
    const visibleFloors = selectedFloor === "all"
      ? floors
      : floors.filter((floor) => String(floor) === selectedFloor);
    elements.floorSections.replaceChildren();

    if (!bays.length) {
      const empty = document.createElement("p");
      empty.className = "loading-message";
      empty.textContent = "No parking bays are configured.";
      elements.floorSections.append(empty);
      return;
    }

    for (const floor of visibleFloors) {
      const floorBays = bays.filter((bay) => bay.floor === floor);
      const group = document.createElement("section");
      group.className = "floor-group";
      const label = document.createElement("div");
      label.className = "floor-label";
      const title = document.createElement("span");
      title.textContent = `Floor ${floor}`;
      const count = document.createElement("small");
      count.textContent = `${floorBays.length} bays`;
      label.append(title, count);
      const grid = document.createElement("div");
      grid.className = "bay-grid";
      grid.setAttribute("role", "group");
      grid.setAttribute("aria-label", `Floor ${floor} parking bays`);

      for (const bay of floorBays) {
        const button = document.createElement("button");
        button.type = "button";
        button.className = `bay ${bay.status}`;
        button.dataset.bayId = bay.id;
        button.setAttribute("aria-label", `${bay.id}, ${bay.status}${bay.vehicle_plate ? `, ${bay.vehicle_plate}` : ""}`);
        const number = document.createElement("span");
        number.className = "bay-number";
        number.textContent = bay.id;
        const state = document.createElement("span");
        state.className = "bay-state";
        state.textContent = bay.vehicle_plate || bay.reservation?.license_plate || bay.status;
        button.append(number, state);
        button.addEventListener("click", () => toggleBay(bay, button));
        grid.append(button);
      }

      group.append(label, grid);
      elements.floorSections.append(group);
    }
  }

  function refreshReservationOptions() {
    const currentValue = elements.reservationBay.value;
    elements.reservationBay.replaceChildren();
    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Choose a bay";
    elements.reservationBay.append(placeholder);
    const available = [...baysById.values()]
      .filter((bay) => bay.status === "available")
      .sort((left, right) => left.floor - right.floor || left.number - right.number);
    for (const bay of available) {
      const option = document.createElement("option");
      option.value = bay.id;
      option.textContent = `${bay.id} · Floor ${bay.floor}`;
      elements.reservationBay.append(option);
    }
    if (available.some((bay) => bay.id === currentValue)) {
      elements.reservationBay.value = currentValue;
    }
    elements.reservationBay.disabled = reservationRequestInFlight || available.length === 0;
    elements.reservationForm.querySelector('button[type="submit"]').disabled =
      reservationRequestInFlight || available.length === 0;
  }

  function renderReservationList(reservations) {
    elements.reservationCount.textContent = reservations.length;
    elements.reservationList.replaceChildren();
    if (!reservations.length) {
      const empty = document.createElement("p");
      empty.className = "empty-state";
      empty.textContent = "No active reservations.";
      elements.reservationList.append(empty);
      return;
    }
    for (const reservation of reservations) {
      const item = document.createElement("div");
      item.className = "reservation-item";
      const details = document.createElement("div");
      details.className = "reservation-details";
      const title = document.createElement("strong");
      title.textContent = `${reservation.bay_id} · ${reservation.license_plate}`;
      const time = document.createElement("small");
      time.textContent = `Until ${new Date(reservation.ends_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
      details.append(title, time);
      const cancel = document.createElement("button");
      cancel.className = "cancel-button";
      cancel.type = "button";
      cancel.textContent = "Cancel";
      cancel.setAttribute("aria-label", `Cancel reservation for ${reservation.bay_id}`);
      cancel.addEventListener("click", () => cancelReservation(reservation.id));
      item.append(details, cancel);
      elements.reservationList.append(item);
    }
  }

  function renderActivity() {
    elements.activityList.replaceChildren();
    if (!activityItems.length) {
      const empty = document.createElement("li");
      empty.className = "empty-state";
      empty.textContent = "Waiting for parking activity…";
      elements.activityList.append(empty);
      return;
    }
    for (const activity of activityItems) {
      const item = document.createElement("li");
      item.className = "activity-item";
      const icon = document.createElement("span");
      icon.className = `activity-icon ${activity.action === "checked out" ? "checkout" : ""}`;
      icon.textContent = activity.action === "checked out" ? "↗" : "↙";
      const copy = document.createElement("span");
      copy.className = "activity-copy";
      const title = document.createElement("strong");
      title.textContent = `${activity.plate} ${activity.action}`;
      const subtitle = document.createElement("small");
      subtitle.textContent = `${activity.bayId} · ${activity.note}`;
      copy.append(title, subtitle);
      const time = document.createElement("time");
      time.className = "activity-time";
      time.dateTime = activity.timestamp.toISOString();
      time.textContent = activity.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      item.append(icon, copy, time);
      elements.activityList.append(item);
    }
  }

  function logActivity(action, bayId, plate, note) {
    activityItems.unshift({ action, bayId, plate, note, timestamp: new Date() });
    activityItems.splice(8);
    renderActivity();
  }

  async function refreshData() {
    const [bays, analytics, reservations] = await Promise.all([
      api("/api/bays"),
      api("/api/analytics"),
      api("/api/reservations"),
    ]);
    baysById.clear();
    for (const bay of bays) baysById.set(bay.id, bay);
    renderBays();
    renderAnalytics(analytics);
    refreshReservationOptions();
    renderReservationList(reservations);
  }

  async function refreshReservations() {
    const reservations = await api("/api/reservations");
    renderReservationList(reservations);
  }

  async function updateBayFromResponse(bay) {
    baysById.set(bay.id, bay);
    renderBays();
    renderAnalytics(await api("/api/analytics"));
    refreshReservationOptions();
    await refreshReservations();
  }

  function makePlate() {
    const suffix = Math.floor(1000 + Math.random() * 9000);
    return `KA-01-SM-${suffix}`;
  }

  async function toggleBay(bay, button) {
    button.disabled = true;
    clearError();
    try {
      if (bay.status === "occupied") {
        const result = await api(`/api/bays/${encodeURIComponent(bay.id)}/check-out`, {
          method: "POST",
        });
        await updateBayFromResponse(result.bay);
        logActivity("checked out", bay.id, result.receipt.license_plate, `₹${result.receipt.amount_inr} · ${result.receipt.duration_minutes} min`);
      } else {
        const plate = bay.status === "reserved" ? bay.reservation?.license_plate : makePlate();
        if (!plate) throw new Error("Reservation details are unavailable for this bay.");
        const result = await api(`/api/bays/${encodeURIComponent(bay.id)}/check-in`, {
          method: "POST",
          body: JSON.stringify({ vehicle_plate: plate, source: "manual" }),
        });
        await updateBayFromResponse(result.bay);
        logActivity("checked in", bay.id, plate, "Manual check-in");
      }
    } catch (error) {
      showError(error.message);
      await refreshData().catch((refreshError) => showError(refreshError.message));
    } finally {
      const currentButton = elements.floorSections.querySelector(`[data-bay-id="${CSS.escape(bay.id)}"]`);
      if (currentButton) currentButton.disabled = false;
    }
  }

  async function cancelReservation(reservationId) {
    clearError();
    try {
      const result = await api(`/api/reservations/${reservationId}`, { method: "DELETE" });
      await updateBayFromResponse(result.bay);
      logActivity("reservation cancelled", result.bay.id, "Reservation", "Bay is available");
    } catch (error) {
      showError(error.message);
    }
  }

  function connectWebSocket() {
    const scheme = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = API_BASE
      ? `${API_BASE.replace(/^http/, "ws")}/ws`
      : `${scheme}//${window.location.host}/ws`;
    let retryDelay = 1000;
    const connect = () => {
      const socket = new WebSocket(wsUrl);
      socket.addEventListener("open", () => {
        retryDelay = 1000;
        elements.connectionStatus.classList.remove("is-disconnected");
        elements.connectionStatus.classList.add("is-connected");
        elements.connectionStatus.lastChild.textContent = " Live";
      });
      socket.addEventListener("message", (event) => {
        let message;
        try {
          message = JSON.parse(event.data);
        } catch (error) {
          showError(`Received an invalid live update: ${error.message}`);
          return;
        }
        if (message.type !== "BAY_UPDATE" || !message.bay) return;
        const previous = baysById.get(message.bay.id);
        baysById.set(message.bay.id, message.bay);
        renderBays();
        refreshReservationOptions();
        if (previous?.status !== message.bay.status) {
          api("/api/analytics").then(renderAnalytics).catch((error) => showError(error.message));
          refreshReservations().catch((error) => showError(error.message));
        }
      });
      socket.addEventListener("close", () => {
        elements.connectionStatus.classList.remove("is-connected");
        elements.connectionStatus.classList.add("is-disconnected");
        elements.connectionStatus.lastChild.textContent = " Reconnecting";
        window.setTimeout(connect, retryDelay);
        retryDelay = Math.min(retryDelay * 2, 15000);
      });
      socket.addEventListener("error", () => socket.close());
    };
    connect();
  }

  document.querySelectorAll(".floor-tab").forEach((button) => {
    button.addEventListener("click", () => {
      selectedFloor = button.dataset.floor;
      document.querySelectorAll(".floor-tab").forEach((tab) => {
        tab.classList.toggle("is-active", tab === button);
      });
      renderBays();
    });
  });

  elements.reservationForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (reservationRequestInFlight) return;
    const form = new FormData(elements.reservationForm);
    reservationRequestInFlight = true;
    refreshReservationOptions();
    clearError();
    try {
      const reservation = await api("/api/reservations", {
        method: "POST",
        body: JSON.stringify({
          bay_id: form.get("bay_id"),
          license_plate: form.get("license_plate"),
        }),
      });
      elements.reservationForm.reset();
      await refreshData();
      logActivity("reserved", reservation.bay_id, reservation.license_plate, "Reservation created");
    } catch (error) {
      showError(error.message);
      await refreshData().catch((refreshError) => showError(refreshError.message));
    } finally {
      reservationRequestInFlight = false;
      refreshReservationOptions();
    }
  });

  document.querySelector("#current-date").textContent =
    new Date().toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });
  refreshData().catch((error) => showError(`Could not load parking data: ${error.message}`));
  connectWebSocket();
})();
