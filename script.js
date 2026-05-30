const datesContainer = document.getElementById("dates");
const monthDiv = document.getElementById("month");
const eventInput = document.getElementById("eventInput");
const eventTime = document.getElementById("eventTime");
const eventsList = document.getElementById("eventsList");
const selectedDayDiv = document.getElementById("selectedDay");
const enableReminderCheckbox = document.getElementById("enableReminder");
const reminderTimeSelect = document.getElementById("reminderTime");

let currentMonth = new Date().getMonth();
let year = new Date().getFullYear();
let selectedDate = null;

const months = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December"
];

// Built-in occasions for 2026 (using 0-based month indices)
const occasions = {
    "2026-0-1": { title: "New Year's Day", type: "holiday" },
    "2026-0-26": { title: "Republic Day (India)", type: "holiday" },
    "2026-1-14": { title: "Valentine's Day", type: "observance" },
    "2026-1-25": { title: "Maha Shivaratri", type: "festival" },
    "2026-2-8": { title: "International Women's Day", type: "observance" },
    "2026-2-15": { title: "Holi (India)", type: "festival" },
    "2026-2-29": { title: "Easter", type: "holiday" },
    "2026-3-2": { title: "Good Friday", type: "holiday" },
    "2026-3-10": { title: "Eid ul-Fitr", type: "festival" },
    "2026-3-14": { title: "Ambedkar Jayanti", type: "observance" },
    "2026-4-1": { title: "Labour Day", type: "holiday" },
    "2026-4-3": { title: "Eid ul-Adha", type: "festival" },
    "2026-4-15": { title: "Buddha Purnima", type: "festival" },
    "2026-5-21": { title: "Father's Day", type: "observance" },
    "2026-6-4": { title: "Independence Day (USA)", type: "holiday" },
    "2026-7-15": { title: "Independence Day (India)", type: "holiday" },
    "2026-7-28": { title: "Krishna Janmashtami", type: "festival" },
    "2026-8-16": { title: "Malaysia Day", type: "holiday" },
    "2026-8-2": { title: "Gandhi Jayanti", type: "observance" },
    "2026-8-5": { title: "Dussehra", type: "festival" },
    "2026-8-25": { title: "Diwali (Lakshmi Puja)", type: "festival" },
    "2026-9-1": { title: "Diwali (Govardhan Puja)", type: "festival" },
    "2026-9-2": { title: "Diwali (Bhai Dooj)", type: "festival" },
    "2026-9-14": { title: "Children's Day (India)", type: "observance" },
    "2026-9-25": { title: "Thanksgiving (USA)", type: "holiday" },
    "2026-10-25": { title: "Christmas", type: "holiday" },
    "2026-10-26": { title: "Boxing Day", type: "holiday" }
};

// Load events from localStorage
function getEvents() {
    const stored = localStorage.getItem("calendarEvents");
    return stored ? JSON.parse(stored) : {};
}

// Save events to localStorage
function saveEvents(events) {
    localStorage.setItem("calendarEvents", JSON.stringify(events));
}

// Load reminders from localStorage
function getReminders() {
    const stored = localStorage.getItem("calendarReminders");
    return stored ? JSON.parse(stored) : {};
}

// Save reminders to localStorage
function saveReminders(reminders) {
    localStorage.setItem("calendarReminders", JSON.stringify(reminders));
}

// Show notification
function showNotification(title, message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-title">🔔 ${title}</div>
        <div class="notification-content">${message}</div>
        <div class="notification-time">${new Date().toLocaleTimeString()}</div>
    `;
    document.body.appendChild(notification);
    
    // Auto-remove after 6 seconds
    setTimeout(() => {
        notification.remove();
    }, 6000);
    
    // Try browser notification API if available
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body: message, icon: '📅' });
    }
}

// Get unique key for a date
function getDateKey(year, month, day) {
    return `${year}-${month}-${day}`;
}

// Get all items (occasions + custom events) for a date
function getDateItems(year, month, day) {
    const dateKey = getDateKey(year, month, day);
    const customEvents = getEvents()[dateKey] || [];
    const occasion = occasions[dateKey];
    
    const items = [];
    
    if (occasion) {
        items.push({
            title: occasion.title,
            type: occasion.type,
            time: "All day",
            id: `occasion-${dateKey}`,
            isOccasion: true
        });
    }
    
    customEvents.forEach(event => {
        items.push({
            ...event,
            type: "event",
            isOccasion: false
        });
    });
    
    return items;
}

// Get CSS class for date based on occasion/event type
function getDateClass(year, month, day) {
    const dateKey = getDateKey(year, month, day);
    const occasion = occasions[dateKey];
    const customEvents = getEvents()[dateKey];
    
    if (occasion) {
        return occasion.type;
    }
    if (customEvents && customEvents.length > 0) {
        return "event";
    }
    return "";
}

// Render the calendar
function loadCalendar() {
    datesContainer.innerHTML = "";
    
    let firstDay = new Date(year, currentMonth, 1).getDay();
    let daysInMonth = new Date(year, currentMonth + 1, 0).getDate();
    
    monthDiv.innerText = months[currentMonth] + " " + year;
    
    // Empty spaces
    for (let i = 0; i < firstDay; i++) {
        let empty = document.createElement("div");
        empty.classList.add("empty");
        datesContainer.appendChild(empty);
    }
    
    // Dates
    const today = new Date();
    
    for (let i = 1; i <= daysInMonth; i++) {
        let dateDiv = document.createElement("div");
        dateDiv.innerText = i;
        
        // Add occasion/event class
        const occasionClass = getDateClass(year, currentMonth, i);
        if (occasionClass) {
            dateDiv.classList.add(occasionClass);
        }
        
        // Check if today
        if (year === today.getFullYear() && 
            currentMonth === today.getMonth() && 
            i === today.getDate()) {
            dateDiv.classList.add("today");
        }
        
        // Check if selected
        if (selectedDate && selectedDate.year === year && 
            selectedDate.month === currentMonth && 
            selectedDate.day === i) {
            dateDiv.classList.add("selected");
        }
        
        // Add indicator if has items
        const items = getDateItems(year, currentMonth, i);
        if (items.length > 1 || (items.length === 1 && items[0].isOccasion && getEvents()[getDateKey(year, currentMonth, i)])) {
            dateDiv.classList.add("has-indicator");
        }
        
        dateDiv.onclick = () => selectDate(year, currentMonth, i);
        datesContainer.appendChild(dateDiv);
    }
}

// Select a date
function selectDate(y, m, d) {
    selectedDate = { year: y, month: m, day: d };
    
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const fullDate = new Date(y, m, d);
    const dayName = dayNames[fullDate.getDay()];
    
    selectedDayDiv.innerText = `${dayName}, ${months[m]} ${d}, ${y}`;
    
    loadCalendar();
    displayEvents();
}

// Add custom event
function addEvent() {
    if (!selectedDate) {
        alert("Please select a date first!");
        return;
    }
    
    const title = eventInput.value.trim();
    const time = eventTime.value || "00:00"; // Default to midnight if no time provided
    const hasReminder = enableReminderCheckbox.checked;
    const reminderMinutes = hasReminder ? parseInt(reminderTimeSelect.value) : null;
    
    if (!title) {
        alert("Please enter an event title!");
        return;
    }
    
    const dateKey = getDateKey(selectedDate.year, selectedDate.month, selectedDate.day);
    const events = getEvents();
    const reminders = getReminders();
    
    if (!events[dateKey]) {
        events[dateKey] = [];
    }
    
    const eventId = Date.now();
    const eventObj = {
        title: title,
        time: time || "No time",
        id: eventId
    };
    
    events[dateKey].push(eventObj);
    
    // Sort events by time
    events[dateKey].sort((a, b) => {
        if (a.time === "No time") return 1;
        if (b.time === "No time") return -1;
        return a.time.localeCompare(b.time);
    });
    
    // Save reminder if enabled
    if (hasReminder && reminderMinutes !== null) {
        if (!reminders[dateKey]) {
            reminders[dateKey] = [];
        }
        reminders[dateKey].push({
            eventId: eventId,
            reminderMinutes: reminderMinutes,
            title: title
        });
        saveReminders(reminders);
    }
    
    saveEvents(events);
    eventInput.value = "";
    eventTime.value = "";
    enableReminderCheckbox.checked = false;
    reminderTimeSelect.disabled = true;
    
    showNotification("Event Added", `"${title}" has been added successfully!`, "success");
    
    loadCalendar();
    displayEvents();
}

// Display events for selected date
function displayEvents() {
    eventsList.innerHTML = "";
    
    if (!selectedDate) {
        eventsList.innerHTML = '<div class="event-item no-events">Select a date to view events</div>';
        return;
    }
    
    const items = getDateItems(selectedDate.year, selectedDate.month, selectedDate.day);
    const dateKey = getDateKey(selectedDate.year, selectedDate.month, selectedDate.day);
    const reminders = getReminders();
    const dateReminders = reminders[dateKey] || [];
    
    if (items.length === 0) {
        eventsList.innerHTML = '<div class="event-item no-events">No events</div>';
        return;
    }
    
    items.forEach(item => {
        const eventDiv = document.createElement("div");
        eventDiv.classList.add("event-item");
        eventDiv.classList.add(`${item.type}-item`);
        
        const typeLabel = item.type.charAt(0).toUpperCase() + item.type.slice(1);
        
        // Check if this event has a reminder
        const hasReminder = dateReminders.some(r => r.eventId === item.id);
        const reminderInfo = dateReminders.find(r => r.eventId === item.id);
        
        if (item.isOccasion) {
            eventDiv.innerHTML = `
                <div style="flex: 1;">
                    <span class="event-type">${typeLabel}</span>
                    <span class="event-title">${item.title}</span>
                </div>
            `;
        } else {
            const reminderBadge = hasReminder ? `<span class="reminder-badge">🔔 Reminder</span>` : '';
            const reminderTime = reminderInfo ? `<div class="reminder-time" style="font-size: 11px; margin-top: 3px;">Reminder: ${getReminderLabel(reminderInfo.reminderMinutes)}</div>` : '';
            
            eventDiv.innerHTML = `
                <div style="flex: 1;">
                    <div>
                        <span class="event-time">${item.time}</span>
                        <span class="event-title">${item.title}</span>
                        ${reminderBadge}
                    </div>
                    ${reminderTime}
                </div>
                <button class="delete-btn" onclick="deleteEvent('${dateKey}', ${item.id})">Delete</button>
            `;
        }
        
        eventsList.appendChild(eventDiv);
    });
}

// Get human-readable reminder label
function getReminderLabel(minutes) {
    if (minutes === 0) return "At event time";
    if (minutes === 30) return "30 mins before";
    if (minutes === 60) return "1 hour before";
    if (minutes === 1440) return "1 day before";
    return `${minutes} mins before`;
}

// Delete custom event
function deleteEvent(dateKey, eventId) {
    const events = getEvents();
    const reminders = getReminders();
    
    if (events[dateKey]) {
        events[dateKey] = events[dateKey].filter(e => e.id !== eventId);
        
        if (events[dateKey].length === 0) {
            delete events[dateKey];
        }
        
        // Also delete associated reminders
        if (reminders[dateKey]) {
            reminders[dateKey] = reminders[dateKey].filter(r => r.eventId !== eventId);
            if (reminders[dateKey].length === 0) {
                delete reminders[dateKey];
            }
            saveReminders(reminders);
        }
        
        saveEvents(events);
        loadCalendar();
        displayEvents();
    }
}

// Check reminders periodically
function checkReminders() {
    const now = new Date();
    const reminders = getReminders();
    const events = getEvents();
    
    // Store checked reminders to avoid duplicate notifications
    const checkedKey = `reminders_checked_${now.toDateString()}`;
    const checkedReminders = JSON.parse(localStorage.getItem(checkedKey) || '{}');
    
    for (const dateKey in reminders) {
        reminders[dateKey].forEach(reminder => {
            const reminderKey = `${dateKey}_${reminder.eventId}`;
            
            if (!checkedReminders[reminderKey]) {
                const [year, month, day] = dateKey.split('-').map(Number);
                const eventTime = events[dateKey]?.find(e => e.id === reminder.eventId)?.time;
                
                if (eventTime) {
                    const [hours, minutes] = eventTime.split(':');
                    const eventDateTime = new Date(year, month, day, hours, minutes);
                    const reminderDateTime = new Date(eventDateTime.getTime() - reminder.reminderMinutes * 60000);
                    
                    // Check if reminder time has passed (within 2 minute window to avoid repeated notifications)
                    const timeDiff = now - reminderDateTime;
                    if (timeDiff >= 0 && timeDiff < 120000) {
                        const reminderText = reminder.reminderMinutes === 0 ? "is happening now!" : `is happening in ${reminder.reminderMinutes} minutes`;
                        showNotification("📅 Event Reminder", `${reminder.title} ${reminderText}`, "warning");
                        checkedReminders[reminderKey] = true;
                    }
                }
            }
        });
    }
    
    localStorage.setItem(checkedKey, JSON.stringify(checkedReminders));
}

// Navigation
function nextMonth() {
    currentMonth++;
    if (currentMonth > 11) {
        currentMonth = 0;
        year++;
    }
    loadCalendar();
}

function prevMonth() {
    currentMonth--;
    if (currentMonth < 0) {
        currentMonth = 11;
        year--;
    }
    loadCalendar();
}

// Initialize
loadCalendar();
displayEvents();

// Reminder checkbox event listener
if (enableReminderCheckbox) {
    enableReminderCheckbox.addEventListener('change', () => {
        reminderTimeSelect.disabled = !enableReminderCheckbox.checked;
    });
}

// Request notification permission
if ('Notification' in window && Notification.permission === 'default') {
    Notification.requestPermission();
}

// Start reminder checker (checks every minute)
setInterval(checkReminders, 60000);
checkReminders(); // Check immediately on load