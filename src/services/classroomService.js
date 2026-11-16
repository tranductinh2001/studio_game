/**
 * Classroom API & SSE Realtime Client for WEBBY CLASSROOM
 */

import { getApiBaseUrl, buildRoomJoinUrl, detectAppEnv } from '../config/environment';

class ClassroomService {
  constructor() {
    this.eventSource = null;
    this.pollingInterval = null;
    this.activeRoomCode = 'WB-601';
  }

  getBaseUrl() {
    return getApiBaseUrl();
  }

  // Get network and dynamic LAN IP info for QR pairing
  async getNetworkInfo() {
    try {
      const res = await fetch(`${this.getBaseUrl()}/network-info`);
      return await res.json();
    } catch (err) {
      console.warn('Network info endpoint unavailable:', err.message);
      return { success: false, lanIp: 'localhost', mobileConnectUrl: '' };
    }
  }

  // Get all classes
  async getClasses() {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes`);
      const data = await res.json();
      return data.classes || [];
    } catch (err) {
      console.warn('Error fetching classes:', err);
      return [];
    }
  }

  // Add new class
  async addClass(classData) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classData)
      });
      const data = await res.json();
      return data.class;
    } catch (err) {
      console.error('Error adding class:', err);
      throw err;
    }
  }

  // Update class
  async updateClass(classId, updateData) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData)
      });
      const data = await res.json();
      return data.class;
    } catch (err) {
      console.error('Error updating class:', err);
      throw err;
    }
  }

  // Delete class
  async deleteClass(classId) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.error('Error deleting class:', err);
      throw err;
    }
  }

  // Get students of a class
  async getStudents(classId = 'CLASS_6A') {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}/students`);
      const data = await res.json();
      return data.students || [];
    } catch (err) {
      console.warn('Error fetching students:', err);
      return [];
    }
  }

  // Bulk save/update class students (e.g. from pasted text or array)
  async saveClassStudents(classId, studentsList) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}/students/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentsList })
      });
      const data = await res.json();
      return data.students || [];
    } catch (err) {
      console.error('Error saving students:', err);
      throw err;
    }
  }

  // Add 1 student to class
  async addStudent(classId, studentData) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}/students`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const data = await res.json();
      return data.student;
    } catch (err) {
      console.error('Error adding student:', err);
      throw err;
    }
  }

  // Append list of students to class
  async appendStudents(classId, studentsList) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}/students/append`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ students: studentsList })
      });
      const data = await res.json();
      return data.students || [];
    } catch (err) {
      console.error('Error appending students:', err);
      throw err;
    }
  }

  // Delete student
  async deleteStudent(classId, studentId) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}/students/${studentId}`, {
        method: 'DELETE'
      });
      return await res.json();
    } catch (err) {
      console.warn('DELETE failed, trying POST fallback:', err);
      try {
        const fallbackRes = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}/students/${studentId}/delete`, {
          method: 'POST'
        });
        return await fallbackRes.json();
      } catch (e) {
        console.error('Error deleting student:', e);
        throw e;
      }
    }
  }

  // Update single student
  async updateStudent(classId, studentId, studentData) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/classes/${classId}/students/${studentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(studentData)
      });
      const data = await res.json();
      return data.student;
    } catch (err) {
      console.error('Error updating student:', err);
      throw err;
    }
  }

  // Switch active class for a room/session
  async setRoomClass(roomCode, classId) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/class/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId })
      });
      const data = await res.json();
      return data.room;
    } catch (err) {
      console.error('Error setting room class:', err);
      throw err;
    }
  }

  // Detect local SMAS Excel file
  async detectSmasFile(customPath = '') {
    try {
      const query = customPath ? `?path=${encodeURIComponent(customPath)}` : '';
      const res = await fetch(`${this.getBaseUrl()}/classroom/smas/detect${query}`);
      return await res.json();
    } catch (err) {
      console.warn('Error detecting SMAS file:', err);
      return { detected: false, error: err.message, classes: [] };
    }
  }

  // Import local SMAS Excel file
  async importLocalSmas(classCodes = null, filePath = null) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/smas/import-local`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classCodes, filePath: filePath || null })
      });
      return await res.json();
    } catch (err) {
      console.error('Error importing local SMAS:', err);
      throw err;
    }
  }

  // Upload and import SMAS file (base64)
  async uploadSmasFile(fileBase64, classCodes = null) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/smas/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fileBase64, classCodes })
      });
      return await res.json();
    } catch (err) {
      console.error('Error uploading SMAS file:', err);
      throw err;
    }
  }

  // Get active room state
  async getRoom(code = this.activeRoomCode) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${code}`);
      const data = await res.json();
      return data.room;
    } catch (err) {
      console.warn('Error fetching room:', err);
      return null;
    }
  }

  // Create room
  async createRoom(roomCode = 'WB-601', classId = 'CLASS_6A') {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ roomCode, classId })
      });
      const data = await res.json();
      return data.room;
    } catch (err) {
      console.error('Error creating room:', err);
      throw err;
    }
  }

  // Set active question
  async setQuestion(roomCode, question, state = 'COLLECTING') {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/question/set`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, state })
      });
      const data = await res.json();
      return data.room;
    } catch (err) {
      console.error('Error setting question:', err);
      throw err;
    }
  }

  // Lock question
  async lockQuestion(roomCode) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/question/lock`, {
        method: 'POST'
      });
      const data = await res.json();
      return data.room;
    } catch (err) {
      console.error('Error locking question:', err);
      throw err;
    }
  }

  // Reveal correct answer
  async revealAnswer(roomCode) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/question/reveal`, {
        method: 'POST'
      });
      const data = await res.json();
      return data.room;
    } catch (err) {
      console.error('Error revealing answer:', err);
      throw err;
    }
  }

  // Submit student QR answers
  async submitResponses(roomCode, responses) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/responses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ responses })
      });
      return await res.json();
    } catch (err) {
      console.error('Error submitting responses:', err);
      throw err;
    }
  }

  // Upload group work poster photo
  async uploadGroupWork(roomCode, { groupNumber, imageUrl, caption = '' }) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/groups/upload`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupNumber, imageUrl, caption })
      });
      return await res.json();
    } catch (err) {
      console.error('Error uploading group work:', err);
      throw err;
    }
  }

  // Get real-time analytics
  async getAnalytics(roomCode) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/analytics`);
      const data = await res.json();
      return data.analytics;
    } catch (err) {
      console.error('Error getting analytics:', err);
      throw err;
    }
  }

  // Generate questions with BitOne AI
  async generateQuestions(params = {}) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/bitone/generate-questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params)
      });
      return await res.json();
    } catch (err) {
      console.error('Error calling BitOne Question API:', err);
      throw err;
    }
  }

  // Analyze assessment results with BitOne AI
  async analyzeResults(analyticsData) {
    try {
      const res = await fetch(`${this.getBaseUrl()}/bitone/analyze-results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(analyticsData)
      });
      const data = await res.json();
      return data.analysis;
    } catch (err) {
      console.error('Error calling BitOne Analysis API:', err);
      throw err;
    }
  }

  // Start room session (WAITING -> ACTIVE)
  async startRoom(roomCode = 'WB-601') {
    try {
      const res = await fetch(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/start`, {
        method: 'POST'
      });
      const data = await res.json();
      return data.room;
    } catch (err) {
      console.error('Error starting room:', err);
      throw err;
    }
  }

  // Subscribe to Resilient Realtime Stream (SSE + Auto-polling fallback)
  subscribeToRoom(roomCode, onEvent) {
    if (this.eventSource) {
      this.eventSource.close();
      this.eventSource = null;
    }
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }

    let isSseActive = false;
    let lastStateHash = '';

    const handleRoomUpdate = (room, eventType = 'ROOM_STATE') => {
      if (!room) return;
      const responsesCount = Object.keys(room.responses || {}).length;
      const qState = room.questionState || '';
      const qIndex = room.activeQuestionIndex || 0;
      const currentHash = `${room.lastUpdated || ''}_${responsesCount}_${qState}_${qIndex}`;

      if (currentHash !== lastStateHash) {
        lastStateHash = currentHash;
        if (onEvent) {
          onEvent({ type: eventType, payload: room });
        }
      }
    };

    // 1. Initial State Fetch
    this.getRoom(roomCode).then(room => {
      if (room) handleRoomUpdate(room, 'ROOM_STATE');
    }).catch(console.warn);

    // 2. Try Server-Sent Events (SSE)
    try {
      this.eventSource = new EventSource(`${this.getBaseUrl()}/classroom/rooms/${roomCode}/events`);

      this.eventSource.onopen = () => {
        isSseActive = true;
      };

      this.eventSource.onmessage = (e) => {
        try {
          isSseActive = true;
          const parsed = JSON.parse(e.data);
          if (parsed && parsed.payload) {
            handleRoomUpdate(parsed.payload, parsed.type || 'ROOM_STATE');
          }
        } catch (parseErr) {
          console.warn('Error parsing SSE event:', parseErr);
        }
      };

      this.eventSource.onerror = () => {
        isSseActive = false;
      };
    } catch (e) {
      isSseActive = false;
    }

    // 3. Resilient Polling Fallback (runs every 1.2s - activates on serverless production or when SSE is down)
    this.pollingInterval = setInterval(async () => {
      if (isSseActive && detectAppEnv() !== 'production') return;

      try {
        const room = await this.getRoom(roomCode);
        if (room) {
          handleRoomUpdate(room, 'ROOM_STATE');
        }
      } catch (pollErr) {
        // silent fail on network hiccups
      }
    }, 1200);

    return () => {
      if (this.eventSource) {
        this.eventSource.close();
        this.eventSource = null;
      }
      if (this.pollingInterval) {
        clearInterval(this.pollingInterval);
        this.pollingInterval = null;
      }
    };
  }
}

export const classroomService = new ClassroomService();

