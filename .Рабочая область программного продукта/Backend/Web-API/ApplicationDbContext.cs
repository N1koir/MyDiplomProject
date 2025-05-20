using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Reflection.Emit;
using Web_API.Models;

namespace Web_API
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        // Таблицы
        public DbSet<Role> Roles { get; set; }
        public DbSet<Username> Usernames { get; set; }
        public DbSet<OpenCategory> OpenCategories { get; set; }
        public DbSet<MonetizationStatus> MonetizationStatuses { get; set; }
        public DbSet<StatusOpenCourses> StatusOpenCourses { get; set; }
        public DbSet<CompletedOpenCourses> CompletedOpenCourses { get; set; }
        public DbSet<PagesOpenCourses> PagesOpenCourses { get; set; }
        public DbSet<DatasOpenCourses> DatasOpenCourses { get; set; }
        public DbSet<OpenCourses> OpenCourses { get; set; }
        public DbSet<Comments> Comments { get; set; }
        public DbSet<ListFavorites> ListFavorites { get; set; }
        public DbSet<EducationalOrganizations> EducationalOrganizations { get; set; }
        public DbSet<EducationLicense> EducationLicenses { get; set; }
        public DbSet<EducationUserRole> EducationUserRoles { get; set; }
        public DbSet<EducationUser> EducationUsers { get; set; }
        public DbSet<EducationCategory> EducationCategories { get; set; }
        public DbSet<PagesCourses> PagesCourses { get; set; }
        public DbSet<DatasCourses> DatasCourses { get; set; }
        public DbSet<EducationCourses> EducationCourses { get; set; }
        public DbSet<EducationList> EducationLists { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.IdRole);
                entity.Property(e => e.IdRole).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).IsRequired();
            });

            // Настройка Username
            modelBuilder.Entity<Username>(entity =>
            {
                entity.HasKey(e => e.IdUsername);
                entity.Property(e => e.IdUsername).UseIdentityAlwaysColumn();
                entity.Property(e => e.Surname).HasMaxLength(50);
                entity.Property(e => e.Name).HasMaxLength(50);
                entity.Property(e => e.Middlename).HasMaxLength(50);
                entity.Property(e => e.Login).HasMaxLength(50);
                entity.Property(e => e.Password).HasMaxLength(50);

                entity.HasOne(u => u.Role)
                    .WithMany(r => r.Usernames)
                    .HasForeignKey(u => u.IdRole)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка OpenCategory
            modelBuilder.Entity<OpenCategory>(entity =>
            {
                entity.HasKey(e => e.IdOpenCategory);
                entity.Property(e => e.IdOpenCategory).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).IsRequired();
            });

            // Настройка MonetizationStatus
            modelBuilder.Entity<MonetizationStatus>(entity =>
            {
                entity.HasKey(e => e.IdMonetizationStatus);
                entity.Property(e => e.IdMonetizationStatus).UseIdentityAlwaysColumn();
                entity.Property(e => e.Type).HasMaxLength(25);
            });

            // Настройка StatusOpenCourses
            modelBuilder.Entity<StatusOpenCourses>(entity =>
            {
                entity.HasKey(e => e.IdStatusOpenCourses);
                entity.Property(e => e.IdStatusOpenCourses).UseIdentityAlwaysColumn();
                entity.Property(e => e.Type).HasMaxLength(25);
            });

            // Настройка CompletedOpenCourses
            modelBuilder.Entity<CompletedOpenCourses>(entity =>
            {
                entity.HasKey(e => e.IdCompletedOpenCourses);
                entity.Property(e => e.IdCompletedOpenCourses).UseIdentityAlwaysColumn();
                entity.Property(e => e.Type).HasMaxLength(25);
            });

            // Настройка PagesOpenCourses
            modelBuilder.Entity<PagesOpenCourses>(entity =>
            {
                entity.HasKey(e => e.IdPagesOpenCourses);
                entity.Property(e => e.IdPagesOpenCourses).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).HasMaxLength(50);
            });

            // Настройка DatasOpenCourses
            modelBuilder.Entity<DatasOpenCourses>(entity =>
            {
                entity.HasKey(e => e.IdDatasOpenCourses);
                entity.Property(e => e.IdDatasOpenCourses).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).IsRequired();

                entity.HasOne(d => d.PagesOpenCourses)
                    .WithMany(p => p.DatasOpenCourses)
                    .HasForeignKey(d => d.IdPagesOpenCourses)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка OpenCourses
            modelBuilder.Entity<OpenCourses>(entity =>
            {
                entity.HasKey(e => e.IdOpenCourses);
                entity.Property(e => e.IdOpenCourses).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).HasMaxLength(50);

                entity.HasOne(o => o.PagesOpenCourses)
                    .WithMany(p => p.OpenCourses)
                    .HasForeignKey(o => o.IdPagesOpenCourses)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(o => o.OpenCategory)
                    .WithMany(c => c.OpenCourses)
                    .HasForeignKey(o => o.IdOpenCategory)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(o => o.CompletedOpenCourses)
                    .WithMany(c => c.OpenCourses)
                    .HasForeignKey(o => o.IdCompletedOpenCourses)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(o => o.MonetizationStatus)
                    .WithMany(m => m.OpenCourses)
                    .HasForeignKey(o => o.IdMonetizationStatus)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(o => o.StatusOpenCourses)
                    .WithMany(s => s.OpenCourses)
                    .HasForeignKey(o => o.IdStatusOpenCourses)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(o => o.Username)
                    .WithMany(u => u.OpenCourses)
                    .HasForeignKey(o => o.IdUsername)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка Comments
            modelBuilder.Entity<Comments>(entity =>
            {
                entity.HasKey(e => e.IdComments);
                entity.Property(e => e.IdComments).UseIdentityAlwaysColumn();

                entity.HasOne(c => c.OpenCourses)
                    .WithMany(o => o.Comments)
                    .HasForeignKey(c => c.IdOpenCourses)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.Username)
                    .WithMany(u => u.Comments)
                    .HasForeignKey(c => c.IdUsername)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка связи многие-ко-многим ListFavorites
            modelBuilder.Entity<ListFavorites>(entity =>
            {
                entity.HasKey(lf => new { lf.IdOpenCourses, lf.IdUsername });

                entity.HasOne(lf => lf.OpenCourses)
                    .WithMany(o => o.ListFavorites)
                    .HasForeignKey(lf => lf.IdOpenCourses)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(lf => lf.Username)
                    .WithMany(u => u.ListFavorites)
                    .HasForeignKey(lf => lf.IdUsername)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка EducationalOrganizations
            modelBuilder.Entity<EducationalOrganizations>(entity =>
            {
                entity.HasKey(e => e.IdEducationalOrganizations);
                entity.Property(e => e.IdEducationalOrganizations).UseIdentityAlwaysColumn();
                entity.Property(e => e.Name).IsRequired();
                entity.Property(e => e.Email).IsRequired();
            });

            // Настройка EducationLicense
            modelBuilder.Entity<EducationLicense>(entity =>
            {
                entity.HasKey(e => e.IdEducationLicense);
                entity.Property(e => e.IdEducationLicense).UseIdentityAlwaysColumn();

                entity.HasOne(l => l.EducationalOrganizations)
                    .WithMany(o => o.EducationLicenses)
                    .HasForeignKey(l => l.IdEducationalOrganizations)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка EducationUserRole
            modelBuilder.Entity<EducationUserRole>(entity =>
            {
                entity.HasKey(e => e.IdEducationUserRole);
                entity.Property(e => e.IdEducationUserRole).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).HasMaxLength(20);
            });

            // Настройка EducationUser
            modelBuilder.Entity<EducationUser>(entity =>
            {
                entity.HasKey(e => e.IdEducationUser);
                entity.Property(e => e.IdEducationUser).UseIdentityAlwaysColumn();

                entity.HasOne(u => u.EducationalOrganizations)
                    .WithMany(o => o.EducationUsers)
                    .HasForeignKey(u => u.IdEducationalOrganizations)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.Username)
                    .WithMany(u => u.EducationUsers)
                    .HasForeignKey(u => u.IdUsername)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(u => u.EducationUserRole)
                    .WithMany(r => r.EducationUsers)
                    .HasForeignKey(u => u.IdEducationUserRole)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка EducationCategory
            modelBuilder.Entity<EducationCategory>(entity =>
            {
                entity.HasKey(e => e.IdEducationCategory);
                entity.Property(e => e.IdEducationCategory).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).IsRequired();
            });

            // Настройка PagesCourses
            modelBuilder.Entity<PagesCourses>(entity =>
            {
                entity.HasKey(e => e.IdPagesCourses);
                entity.Property(e => e.IdPagesCourses).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).HasMaxLength(50);
            });

            // Настройка DatasCourses
            modelBuilder.Entity<DatasCourses>(entity =>
            {
                entity.HasKey(e => e.IdDatasOpenCourses);
                entity.Property(e => e.IdDatasOpenCourses).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).IsRequired();

                entity.HasOne(d => d.PagesCourses)
                    .WithMany(p => p.DatasCourses)
                    .HasForeignKey(d => d.IdPagesCourses)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка EducationCourses
            modelBuilder.Entity<EducationCourses>(entity =>
            {
                entity.HasKey(e => e.IdEducationCourses);
                entity.Property(e => e.IdEducationCourses).UseIdentityAlwaysColumn();
                entity.Property(e => e.Title).HasMaxLength(50);

                entity.HasOne(c => c.PagesCourses)
                    .WithMany(p => p.EducationCourses)
                    .HasForeignKey(c => c.IdPagesCourses)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.EducationCategory)
                    .WithMany(cat => cat.EducationCourses)
                    .HasForeignKey(c => c.IdEducationCategory)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(c => c.EducationUser)
                    .WithMany(u => u.EducationCourses)
                    .HasForeignKey(c => c.IdEducationUser)
                    .OnDelete(DeleteBehavior.Cascade);
            });

            // Настройка связи многие-ко-многим EducationList
            modelBuilder.Entity<EducationList>(entity =>
            {
                entity.HasKey(el => new { el.IdEducationCourses, el.IdEducationUser });

                entity.HasOne(el => el.EducationCourses)
                    .WithMany(ec => ec.EducationLists)
                    .HasForeignKey(el => el.IdEducationCourses)
                    .OnDelete(DeleteBehavior.Cascade);

                entity.HasOne(el => el.EducationUser)
                    .WithMany(eu => eu.EducationLists)
                    .HasForeignKey(el => el.IdEducationUser)
                    .OnDelete(DeleteBehavior.Cascade);
            });
        }
    }
}
