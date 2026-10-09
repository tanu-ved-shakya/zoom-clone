import datetime
from database import engine, SessionLocal, Base
import models

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    if db.query(models.User).count() > 0:
        print('Database already seeded.')
        db.close()
        return

    alex = models.User(
        email='alex.morgan@zoomclone.local',
        display_name='Alex Morgan',
        avatar_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        timezone='America/New_York',
        created_at=datetime.datetime.utcnow().isoformat()
    )
    db.add(alex)
    db.commit()
    db.refresh(alex)

    now = datetime.datetime.utcnow()
    m1_time = (now + datetime.timedelta(hours=2)).isoformat()
    m2_time = (now + datetime.timedelta(days=1, hours=4)).isoformat()
    m3_time = (now + datetime.timedelta(days=2, hours=1)).isoformat()

    upcoming_meetings = [
        models.Meeting(
            meeting_code='49281729104',
            invite_token='tok_weekly_sync_492',
            host_id=alex.id,
            title='Design System & Workplace Sync',
            description='Review sprint components, interactive states, and mobile responsiveness.',
            type='scheduled',
            status='scheduled',
            scheduled_start=m1_time,
            duration_minutes=45,
            timezone='America/New_York',
            created_at=now.isoformat()
        ),
        models.Meeting(
            meeting_code='81920394851',
            invite_token='tok_arch_rev_819',
            host_id=alex.id,
            title='Q3 Frontend & ScalerAI Roadmap',
            description='Discuss architecture, WebRTC video pipelines, and milestone deliverables.',
            type='scheduled',
            status='scheduled',
            scheduled_start=m2_time,
            duration_minutes=60,
            timezone='America/New_York',
            created_at=now.isoformat()
        ),
        models.Meeting(
            meeting_code='93817264510',
            invite_token='tok_client_demo_938',
            host_id=alex.id,
            title='Enterprise Customer Showcase & Demo',
            description='Full interactive walkthrough of the Zoom workplace clone interface.',
            type='scheduled',
            status='scheduled',
            scheduled_start=m3_time,
            duration_minutes=30,
            timezone='America/New_York',
            created_at=now.isoformat()
        )
    ]

    for m in upcoming_meetings:
        db.add(m)
    db.commit()

    past1_time = (now - datetime.timedelta(days=1)).isoformat()
    past2_time = (now - datetime.timedelta(days=3)).isoformat()

    recent_meetings = [
        models.Meeting(
            meeting_code='62918401928',
            invite_token='tok_sprint_retro_629',
            host_id=alex.id,
            title='Sprint 14 Retro & Engineering Review',
            description='Sprint wrap-up, achievements, and open tech-debt retrospectives.',
            type='scheduled',
            status='ended',
            scheduled_start=past1_time,
            duration_minutes=45,
            timezone='America/New_York',
            started_at=past1_time,
            ended_at=(now - datetime.timedelta(days=1, minutes=-45)).isoformat(),
            created_at=past1_time
        ),
        models.Meeting(
            meeting_code='37190284561',
            invite_token='tok_1on1_sarah_371',
            host_id=alex.id,
            title='1:1 Touchpoint w/ Sarah Connor',
            description='Bi-weekly career progression and technical check-in.',
            type='instant',
            status='ended',
            duration_minutes=30,
            timezone='America/New_York',
            started_at=past2_time,
            ended_at=(now - datetime.timedelta(days=3, minutes=-30)).isoformat(),
            created_at=past2_time
        )
    ]

    for m in recent_meetings:
        db.add(m)
    db.commit()

    participants_data = [
        ('David Miller', 'participant', 0, 1),
        ('Sarah Connor', 'participant', 1, 1),
        ('Emily Chen', 'participant', 0, 0),
        ('Marcus Vance', 'participant', 1, 1),
    ]

    for m in upcoming_meetings + recent_meetings:
        db.add(models.Participant(
            meeting_id=m.id,
            user_id=alex.id,
            display_name=alex.display_name,
            role='host',
            status='joined' if m.status in ('scheduled', 'live') else 'left',
            is_muted=0,
            is_video_on=1
        ))
        for name, role, is_muted, is_vid in participants_data[:2]:
            db.add(models.Participant(
                meeting_id=m.id,
                user_id=None,
                display_name=name,
                role=role,
                status='joined' if m.status in ('scheduled', 'live') else 'left',
                is_muted=is_muted,
                is_video_on=is_vid
            ))

    db.commit()
    db.close()
    print('Database successfully seeded with realistic Zoom data!')

if __name__ == '__main__':
    seed_database()
