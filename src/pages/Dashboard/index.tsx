/* eslint-disable import/no-duplicates */
import React, { useState, useCallback, useEffect, useMemo } from 'react';

import { isToday, format, parseISO, isAfter } from 'date-fns';

import ptBR from 'date-fns/locale/pt-BR';

import DayPicker, { DayModifiers } from 'react-day-picker';
import 'react-day-picker/lib/style.css';

import { FiPower, FiClock } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import {
  Container,
  Header,
  HeaderContent,
  Profile,
  Content,
  Schedule,
  NextAppointment,
  Section,
  Appointment,
  Calendar,
} from './styles';

import logoImg from '../../assets/logo.svg';
import { useAuth } from '../../hooks/auth';
import api from '../../services/api';

interface MonthAvailabilityItem {
  day: number;
  available: boolean;
}

interface Appointment {
  id: string;
  date: string;
  hourFormatted: string;
  user: {
    name: string;
    avatar_url: string;
  };
}

const Dashboard: React.FC = () => {
  const { user, signOut } = useAuth();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [monthAvailability, setMonthAvailability] = useState<
    MonthAvailabilityItem[]
  >([]);

  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const handleDateChange = useCallback((day: Date, modifiers: DayModifiers) => {
    if (modifiers.available && !modifiers.disabled) {
      setSelectedDate(day);
    }
  }, []);

  const handleMonthChange = useCallback((month: Date) => {
    setCurrentMonth(month);
  }, []);

  useEffect(() => {
    api
      .get(`/providers/${user.id}/month-availability`, {
        params: {
          year: currentMonth.getFullYear(),
          month: currentMonth.getMonth() + 1,
        },
      })
      .then(response => {
        setMonthAvailability(response.data);
      });
  }, [currentMonth, user.id]);

  useEffect(() => {
    api
      .get<Appointment[]>('/appointments/me', {
        params: {
          year: selectedDate.getFullYear(),
          month: selectedDate.getMonth() + 1,
          day: selectedDate.getDate(),
        },
      })
      .then(response => {
        const appointmentsFormatted = response.data.map(appointment => {
          return {
            ...appointment,
            hourFormatted: format(parseISO(appointment.date), 'HH:mm'),
          };
        });

        setAppointments(appointmentsFormatted);
      });
  }, [selectedDate]);

  const disabledDays = useMemo(() => {
    const dates = monthAvailability
      .filter(monthDay => monthDay.available === false)
      .map(monthDay => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();

        return new Date(year, month, monthDay.day);
      });

    return dates;
  }, [currentMonth, monthAvailability]);

  const selectedDateAsText = useMemo(() => {
    return format(selectedDate, "'Dia' dd 'de' MMMM", {
      locale: ptBR,
    });
  }, [selectedDate]);

  const selectedWeekDay = useMemo(() => {
    return format(selectedDate, 'cccc', { locale: ptBR });
  }, [selectedDate]);

  const morningAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      return parseISO(appointment.date).getHours() < 12;
    });
  }, [appointments]);

  const afternoonAppointments = useMemo(() => {
    return appointments.filter(appointment => {
      return parseISO(appointment.date).getHours() >= 12;
    });
  }, [appointments]);

  const nextAppointment = useMemo(() => {
    return appointments.find(appointment =>
      isAfter(parseISO(appointment.date), new Date()),
    );
  }, [appointments]);
  console.log(nextAppointment);
  return (
    <Container>
      <Header>
        <HeaderContent>
          <img src={logoImg} alt="GoBarber" />

          <Profile>
            <img src={user.avatar_url} alt={user.name} />
            <div>
              <span>Bem-vindo,</span>
              <Link to="/profile">
                <strong>{user.name}</strong>
              </Link>
            </div>
          </Profile>

          <button type="button" onClick={signOut}>
            <FiPower />
          </button>
        </HeaderContent>
      </Header>

      <Content>
        <Schedule>
          <h1>Horários agendados</h1>
          <p>
            {isToday(selectedDate) && <span>Hoje</span>}
            <span>{selectedDateAsText}</span>
            <span>{selectedWeekDay}</span>
          </p>

          {isToday(selectedDate) && nextAppointment && (
            <NextAppointment>
              <strong>Agendamento a seguir</strong>
              <div>
                <img
                  src={
                    nextAppointment.user.avatar_url ||
                    'data:image/jpeg;base64,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'
                  }
                  alt={nextAppointment.user.name}
                />

                <strong>{nextAppointment.user.name}</strong>
                <span>
                  <FiClock />
                  {nextAppointment.hourFormatted}
                </span>
              </div>
            </NextAppointment>
          )}

          <Section>
            <strong>Manhã</strong>

            {morningAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {morningAppointments.map(appointment => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>

                <div>
                  <img
                    src={
                      appointment.user.avatar_url ||
                      'data:image/jpeg;base64,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'
                    }
                    alt={appointment.user.name}
                  />

                  <strong>{appointment.user.name}</strong>
                </div>
              </Appointment>
            ))}
          </Section>

          <Section>
            <strong>Tarde</strong>

            {afternoonAppointments.length === 0 && (
              <p>Nenhum agendamento neste período</p>
            )}

            {afternoonAppointments.map(appointment => (
              <Appointment key={appointment.id}>
                <span>
                  <FiClock />
                  {appointment.hourFormatted}
                </span>

                <div>
                  <img
                    src={
                      appointment.user.avatar_url ||
                      'data:image/jpeg;base64,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'
                    }
                    alt={appointment.user.name}
                  />

                  <strong>{appointment.user.name}</strong>
                </div>
              </Appointment>
            ))}
          </Section>
        </Schedule>
        <Calendar>
          <DayPicker
            weekdaysShort={['D', 'S', 'T', 'Q', 'Q', 'S', 'S']}
            fromMonth={new Date()}
            disabledDays={[{ daysOfWeek: [0, 6] }, ...disabledDays]}
            modifiers={{
              available: { daysOfWeek: [1, 2, 3, 4, 5] },
            }}
            onMonthChange={handleMonthChange}
            selectedDays={selectedDate}
            onDayClick={handleDateChange}
            months={[
              'Janeiro',
              'Fevereiro',
              'Março',
              'Abril',
              'Maio',
              'Junho',
              'Julho',
              'Agosto',
              'Setembro',
              'Outubro',
              'Novembro',
              'Dezembro',
            ]}
          />
        </Calendar>
      </Content>
    </Container>
  );
};

export default Dashboard;
